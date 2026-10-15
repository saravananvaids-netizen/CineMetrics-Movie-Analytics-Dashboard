"""
visualizations.py - CineMetrics Visualization Engine
Generates interactive Plotly figures and publication-quality statistical charts
using Plotly, Matplotlib, and Seaborn.
"""

import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np

CINEMA_THEME = {
    'bg': '#0b0f17',
    'paper': '#0b0f17',
    'text': '#f1f5f9',
    'gold': '#f59e0b',
    'red': '#e11d48',
    'grid': 'rgba(255, 255, 255, 0.08)'
}

def plot_top_grossing(df: pd.DataFrame, top_n: int = 10) -> go.Figure:
    """Creates a horizontal bar chart of the highest grossing movies."""
    top_df = df.sort_values(by='revenue', ascending=True).tail(top_n)
    
    fig = go.Figure(go.Bar(
        x=top_df['revenue'] / 1e6,
        y=top_df['title'],
        orientation='h',
        marker=dict(
            color=top_df['revenue'],
            colorscale=[[0, '#e11d48'], [0.5, '#f59e0b'], [1.0, '#10b981']],
            showscale=False
        ),
        text=(top_df['revenue'] / 1e6).round(1).astype(str) + "M",
        textposition='outside'
    ))
    
    fig.update_layout(
        title=f"Top {top_n} Highest-Grossing Movies (Worldwide USD Millions)",
        xaxis_title="Box Office Revenue ($ Millions)",
        yaxis_title="",
        plot_bgcolor=CINEMA_THEME['bg'],
        paper_bgcolor=CINEMA_THEME['paper'],
        font=dict(color=CINEMA_THEME['text']),
        margin=dict(l=20, r=40, t=50, b=40),
        xaxis=dict(gridcolor=CINEMA_THEME['grid'])
    )
    return fig

def plot_budget_vs_revenue(df: pd.DataFrame) -> go.Figure:
    """Generates an interactive scatter plot comparing Budget vs Revenue with break-even line."""
    filtered = df[(df['budget'] > 0) & (df['revenue'] > 0)].copy()
    
    filtered['budget_m'] = filtered['budget'] / 1e6
    filtered['revenue_m'] = filtered['revenue'] / 1e6
    
    fig = px.scatter(
        filtered,
        x='budget_m',
        y='revenue_m',
        color='primary_genre',
        size='popularity',
        hover_name='title',
        hover_data={'budget_m': ':.1f', 'revenue_m': ':.1f', 'rating': True},
        title="Production Budget vs. Worldwide Revenue ($ Millions)",
        labels={'budget_m': 'Budget ($M)', 'revenue_m': 'Revenue ($M)', 'primary_genre': 'Genre'}
    )
    
    # Add Break-Even Reference Line (y = x)
    max_val = max(filtered['budget_m'].max(), filtered['revenue_m'].max())
    fig.add_trace(go.Scatter(
        x=[0, max_val],
        y=[0, max_val],
        mode='lines',
        name='Break-Even Line (1.0x)',
        line=dict(color='#94a3b8', dash='dash')
    ))
    
    fig.update_layout(
        plot_bgcolor=CINEMA_THEME['bg'],
        paper_bgcolor=CINEMA_THEME['paper'],
        font=dict(color=CINEMA_THEME['text']),
        xaxis=dict(gridcolor=CINEMA_THEME['grid']),
        yaxis=dict(gridcolor=CINEMA_THEME['grid'])
    )
    return fig

def plot_rating_distribution(df: pd.DataFrame) -> go.Figure:
    """Generates a distribution histogram of audience & critic ratings."""
    fig = px.histogram(
        df,
        x='rating',
        nbins=20,
        title="Movie Rating Distribution (Scale 1.0 - 10.0)",
        labels={'rating': 'Rating Score'},
        color_discrete_sequence=['#f59e0b']
    )
    fig.update_layout(
        plot_bgcolor=CINEMA_THEME['bg'],
        paper_bgcolor=CINEMA_THEME['paper'],
        font=dict(color=CINEMA_THEME['text']),
        xaxis=dict(gridcolor=CINEMA_THEME['grid']),
        yaxis=dict(gridcolor=CINEMA_THEME['grid'])
    )
    return fig

def plot_genre_breakdown(genre_stats_df: pd.DataFrame) -> go.Figure:
    """Generates a donut chart displaying total revenue distribution across genres."""
    fig = px.pie(
        genre_stats_df,
        names='genre',
        values='total_revenue',
        title="Box Office Market Share by Genre",
        hole=0.45,
        color_discrete_sequence=px.colors.sequential.Sunsetdark
    )
    fig.update_layout(
        plot_bgcolor=CINEMA_THEME['bg'],
        paper_bgcolor=CINEMA_THEME['paper'],
        font=dict(color=CINEMA_THEME['text'])
    )
    return fig

def plot_correlation_matrix(df: pd.DataFrame) -> go.Figure:
    """Computes and renders a Pearson correlation heatmap for numeric metrics."""
    cols = ['budget', 'revenue', 'rating', 'popularity', 'vote_count', 'runtime', 'release_year']
    available = [c for c in cols if c in df.columns]
    corr = df[available].corr().round(2)
    
    fig = px.imshow(
        corr,
        text_auto=True,
        aspect="auto",
        color_continuous_scale='RdBu_r',
        title="Correlation Heatmap (Numeric Attributes)"
    )
    fig.update_layout(
        plot_bgcolor=CINEMA_THEME['bg'],
        paper_bgcolor=CINEMA_THEME['paper'],
        font=dict(color=CINEMA_THEME['text'])
    )
    return fig
