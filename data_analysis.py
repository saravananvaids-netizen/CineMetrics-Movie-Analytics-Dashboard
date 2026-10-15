"""
data_analysis.py - CineMetrics Core Data Analysis Module
Handles data ingestion, cleaning, validation, statistical metrics,
and risk profiling for movie datasets using pandas and NumPy.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List

REQUIRED_COLUMNS = ['title', 'rating', 'budget', 'revenue', 'popularity']

def load_and_clean_data(file_path_or_buffer) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads movie data from a CSV path or file buffer, validates required schema,
    imputes missing values appropriately, and computes derived financial metrics.
    """
    df = pd.read_csv(file_path_or_buffer)
    
    # Standardize column headers
    df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]
    
    # Schema validation & audit metrics
    total_raw_rows = len(df)
    missing_report = df.isnull().sum().to_dict()
    duplicates_removed = int(df.duplicated(subset=['title']).sum())
    
    # Deduplicate based on title
    df = df.drop_duplicates(subset=['title']).copy()
    
    # Ensure numeric columns are properly coerced
    numeric_cols = ['rating', 'budget', 'revenue', 'popularity', 'vote_count', 'runtime', 'release_year']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        else:
            if col == 'release_year' and 'release_date' in df.columns:
                df['release_year'] = pd.to_datetime(df['release_date'], errors='coerce').dt.year
            else:
                df[col] = np.nan

    # Fill defaults for missing numeric features
    df['rating'] = df['rating'].fillna(df['rating'].median() if df['rating'].notnull().any() else 7.0)
    df['budget'] = df['budget'].fillna(0)
    df['revenue'] = df['revenue'].fillna(0)
    df['popularity'] = df['popularity'].fillna(df['popularity'].median() if df['popularity'].notnull().any() else 50.0)
    df['vote_count'] = df['vote_count'].fillna(100).astype(int)
    df['runtime'] = df['runtime'].fillna(115).astype(int)
    df['release_year'] = df['release_year'].fillna(2020).astype(int)

    # Clean textual genres
    if 'genres' in df.columns:
        df['genres'] = df['genres'].astype(str).str.replace(r"[\[\]'\"]", "", regex=True)
    elif 'primary_genre' in df.columns:
        df['genres'] = df['primary_genre'].astype(str)
    else:
        df['genres'] = 'Drama'

    # Extract primary genre
    df['primary_genre'] = df['genres'].apply(lambda x: [g.strip() for g in str(x).split(',')][0] if str(x).strip() else 'Drama')

    # Financial derived metrics
    df['profit'] = df['revenue'] - df['budget']
    df['roi'] = np.where(df['budget'] > 0, ((df['revenue'] - df['budget']) / df['budget']) * 100, 0.0)
    df['revenue_multiplier'] = np.where(df['budget'] > 0, df['revenue'] / df['budget'], 1.0)
    
    # Risk category classification
    def classify_risk(row):
        if row['budget'] <= 0:
            return 'Undisclosed Budget'
        mult = row['revenue_multiplier']
        if mult >= 3.5:
            return 'Blockbuster Hit'
        elif mult >= 2.0:
            return 'Profitable Asset'
        elif mult >= 1.0:
            return 'Moderate / Break-Even'
        else:
            return 'Box Office Deficit'

    df['risk_category'] = df.apply(classify_risk, axis=1)

    # Calculate overall dataset health score (0 - 100)
    missing_ratio = sum(missing_report.values()) / max(1, (total_raw_rows * len(df.columns)))
    health_score = max(20, min(100, int(100 - (missing_ratio * 50) - (duplicates_removed / max(1, total_raw_rows) * 30))))

    audit_summary = {
        'total_rows': total_raw_rows,
        'valid_rows': len(df),
        'duplicates_removed': duplicates_removed,
        'missing_fields': missing_report,
        'data_health_score': health_score
    }
    
    return df, audit_summary

def get_kpi_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """Computes high-level Executive KPIs across the movie portfolio."""
    if df.empty:
        return {}
    
    total_movies = len(df)
    avg_rating = float(df['rating'].mean())
    
    # Financial metrics for movies with positive box office
    rev_df = df[df['revenue'] > 0]
    total_revenue = float(rev_df['revenue'].sum()) if not rev_df.empty else 0.0
    highest_grossing_row = df.loc[df['revenue'].idxmax()] if not rev_df.empty else None
    
    # Most common genre
    genre_counts = df['primary_genre'].value_counts()
    most_popular_genre = genre_counts.index[0] if not genre_counts.empty else "N/A"
    
    # Release span
    min_year = int(df['release_year'].min())
    max_year = int(df['release_year'].max())

    return {
        'total_movies': total_movies,
        'avg_rating': round(avg_rating, 2),
        'total_revenue': total_revenue,
        'highest_grossing_title': highest_grossing_row['title'] if highest_grossing_row is not None else "N/A",
        'highest_grossing_val': float(highest_grossing_row['revenue']) if highest_grossing_row is not None else 0.0,
        'most_popular_genre': most_popular_genre,
        'year_span': f"{min_year} - {max_year}"
    }

def get_genre_statistics(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates movie count, average rating, total revenue, and average ROI by genre."""
    records = []
    
    # Unpack multi-genre strings into individual rows
    for _, row in df.iterrows():
        genre_list = [g.strip() for g in str(row['genres']).split(',') if g.strip()]
        for g in genre_list:
            records.append({
                'genre': g,
                'rating': row['rating'],
                'budget': row['budget'],
                'revenue': row['revenue'],
                'profit': row['profit'],
                'popularity': row['popularity']
            })
            
    gdf = pd.DataFrame(records)
    if gdf.empty:
        return pd.DataFrame()
        
    grouped = gdf.groupby('genre').agg(
        movie_count=('rating', 'count'),
        avg_rating=('rating', 'mean'),
        total_revenue=('revenue', 'sum'),
        avg_budget=('budget', 'mean'),
        avg_popularity=('popularity', 'mean')
    ).reset_index()
    
    grouped['avg_rating'] = grouped['avg_rating'].round(2)
    grouped['avg_popularity'] = grouped['avg_popularity'].round(1)
    return grouped.sort_values(by='total_revenue', ascending=False)
