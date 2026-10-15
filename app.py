"""
app.py - CineMetrics: Movie Analytics Dashboard
Main Streamlit Application featuring interactive dashboards, ML forecasting,
content-based recommendations, and TMDB integration.
"""

import os
import streamlit as st
import pandas as pd
import numpy as np

from data_analysis import load_and_clean_data, get_kpi_summary, get_genre_statistics
from visualizations import (
    plot_top_grossing,
    plot_budget_vs_revenue,
    plot_rating_distribution,
    plot_genre_breakdown,
    plot_correlation_matrix
)
from prediction import MovieRevenuePredictor
from recommendations import MovieRecommender
from tmdb_api import is_api_configured, search_movies

# 1. Page Configuration
st.set_page_config(
    page_title="CineMetrics – Movie Analytics Dashboard",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Cinema-Themed Custom CSS
st.markdown("""
<style>
    /* Dark Navy & Gold Cinema Aesthetic */
    .stApp {
        background-color: #080c14;
        color: #f1f5f9;
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }
    
    [data-testid="stSidebar"] {
        background-color: #0b0f17;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .metric-card {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 1.25rem;
        margin-bottom: 1rem;
    }
    
    .metric-title {
        color: #94a3b8;
        font-size: 0.85rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .metric-value {
        color: #f59e0b;
        font-size: 1.8rem;
        font-weight: 700;
        margin-top: 0.25rem;
        font-variant-numeric: tabular-nums;
    }

    .stButton>button {
        background: #e11d48;
        color: white;
        border-radius: 6px;
        border: none;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .stButton>button:hover {
        background: #be123c;
        color: white;
    }
</style>
""", unsafe_allow_html=True)

# 3. Data Initialization
@st.cache_data
def get_dataset():
    sample_path = os.path.join(os.path.dirname(__file__), 'data', 'movies.csv')
    df, audit = load_and_clean_data(sample_path)
    return df, audit

default_df, default_audit = get_dataset()

# 4. Sidebar Navigation
st.sidebar.title("🎬 CineMetrics")
st.sidebar.caption("Movie Industry Intelligence & Machine Learning")

uploaded_file = st.sidebar.file_uploader("Upload Movie Dataset (CSV)", type=["csv"])
if uploaded_file is not None:
    df, audit = load_and_clean_data(uploaded_file)
    st.sidebar.success(f"Loaded custom dataset: {len(df)} titles (Health: {audit['data_health_score']}%)")
else:
    df, audit = default_df, default_audit

nav_choice = st.sidebar.radio(
    "Navigation",
    ["Dashboard Overview", "Movie Explorer", "Genre Analysis", "Revenue & Box Office", "ML Predictions", "Dataset & About"]
)

# 5. Route Views
if nav_choice == "Dashboard Overview":
    st.header("Executive Movie Intelligence Overview")
    kpis = get_kpi_summary(df)

    # KPI Metrics Row
    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Total Movies</div>
            <div class="metric-value">{kpis.get('total_movies', 0):,}</div>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Average Rating</div>
            <div class="metric-value">{kpis.get('avg_rating', 0.0)} / 10</div>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        rev_b = kpis.get('total_revenue', 0.0) / 1e9
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Total Box Office</div>
            <div class="metric-value">${rev_b:.2f}B</div>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Top Genre</div>
            <div class="metric-value">{kpis.get('most_popular_genre', 'N/A')}</div>
        </div>
        """, unsafe_allow_html=True)
    with col5:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Release Span</div>
            <div class="metric-value">{kpis.get('year_span', 'N/A')}</div>
        </div>
        """, unsafe_allow_html=True)

    # Top Visualizations Split
    row1_col1, row1_col2 = st.columns([3, 2])
    with row1_col1:
        st.plotly_chart(plot_top_grossing(df, top_n=8), use_container_width=True)
    with row1_col2:
        gstats = get_genre_statistics(df)
        st.plotly_chart(plot_genre_breakdown(gstats), use_container_width=True)

elif nav_choice == "Movie Explorer":
    st.header("Film Catalog & Comparative Explorer")
    
    col_s1, col_s2, col_s3 = st.columns([3, 2, 2])
    with col_s1:
        search_query = st.text_input("🔍 Search Movie by Title", "")
    with col_s2:
        all_genres = sorted(list(set(df['primary_genre'].dropna())))
        selected_genre = st.selectbox("Filter Genre", ["All"] + all_genres)
    with col_s3:
        sort_by = st.selectbox("Sort By", ["popularity", "rating", "revenue", "budget", "release_year"])

    filtered = df.copy()
    if search_query:
        filtered = filtered[filtered['title'].str.contains(search_query, case=False, na=False)]
    if selected_genre != "All":
        filtered = filtered[filtered['primary_genre'] == selected_genre]
    filtered = filtered.sort_values(by=sort_by, ascending=False)

    st.caption(f"Displaying {len(filtered)} matching movies")
    st.dataframe(
        filtered[['title', 'release_year', 'primary_genre', 'rating', 'budget', 'revenue', 'popularity', 'risk_category']],
        use_container_width=True
    )

elif nav_choice == "Genre Analysis":
    st.header("Genre Performance & Market Dynamics")
    gstats = get_genre_statistics(df)
    
    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(plot_genre_breakdown(gstats), use_container_width=True)
    with col2:
        st.subheader("Genre Portfolio Breakdown")
        st.dataframe(gstats, use_container_width=True)

elif nav_choice == "Revenue & Box Office":
    st.header("Box Office & Return on Investment (ROI) Analysis")
    st.plotly_chart(plot_budget_vs_revenue(df), use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(plot_rating_distribution(df), use_container_width=True)
    with col2:
        st.plotly_chart(plot_correlation_matrix(df), use_container_width=True)

elif nav_choice == "ML Predictions":
    st.header("Machine Learning Analytics & Forecasting")
    
    tab1, tab2 = st.tabs(["💰 Box Office Revenue Forecast", "🎯 Content-Based Movie Recommender"])
    
    with tab1:
        st.subheader("Predict Box Office Revenue (Ridge Regression)")
        predictor = MovieRevenuePredictor()
        metrics = predictor.fit(df)
        
        if "error" in metrics:
            st.error(metrics["error"])
        else:
            col_m1, col_m2, col_m3 = st.columns(3)
            col_m1.metric("Model R² Score", f"{metrics['r2_score']:.3f}")
            col_m2.metric("Mean Absolute Error (MAE)", f"${metrics['mae_usd'] / 1e6:.1f}M")
            col_m3.metric("Root Mean Squared Error (RMSE)", f"${metrics['rmse_usd'] / 1e6:.1f}M")
            
            st.markdown("---")
            st.write("#### Experiment with a New Movie Concept:")
            col_in1, col_in2, col_in3 = st.columns(3)
            with col_in1:
                in_budget = st.number_input("Production Budget ($ USD)", min_value=1_000_000, max_value=400_000_000, value=75_000_000, step=5_000_000)
            with col_in2:
                in_genre = st.selectbox("Primary Genre", ["Action", "Adventure", "Science Fiction", "Drama", "Animation", "Comedy", "Thriller", "Horror"])
            with col_in3:
                in_runtime = st.slider("Runtime (Minutes)", 70, 220, 120)

            if st.button("Generate Revenue Forecast"):
                pred = predictor.predict(budget=in_budget, genre=in_genre, runtime=in_runtime)
                st.success(f"**Predicted Worldwide Gross:** ${pred['predicted_revenue'] / 1e6:.1f} Million USD")
                st.info(f"Estimated Profit: ${pred['predicted_profit'] / 1e6:.1f}M | Expected ROI: {pred['estimated_roi']}%")

    with tab2:
        st.subheader("Content-Based Movie Recommender (TF-IDF & Cosine Similarity)")
        recommender = MovieRecommender()
        recommender.fit(df)
        
        target_title = st.selectbox("Select Target Film:", sorted(df['title'].tolist()))
        if st.button("Find Similar Films"):
            recs = recommender.get_recommendations(target_title, top_n=5)
            for r in recs:
                st.markdown(f"**{r['title']}** ({r['release_year']}) — *Similarity: {r['similarity_score']}%*")
                st.caption(f"Genres: {r['genres']} | Rating: {r['rating']}/10")
                st.write(r['overview'])
                st.markdown("---")

elif nav_choice == "Dataset & About":
    st.header("About CineMetrics & Dataset Health Audit")
    st.write(f"**Data Health Score:** {audit['data_health_score']}/100")
    st.write(f"Total Records: {audit['valid_rows']} (Duplicates Removed: {audit['duplicates_removed']})")
    
    st.download_button(
        label="Download Processed Dataset (CSV)",
        data=df.to_csv(index=False),
        file_name="cinemetrics_export.csv",
        mime="text/csv"
    )
