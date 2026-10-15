"""
recommendations.py - Content-Based Recommendation Engine
Recommends similar movies using scikit-learn's TfidfVectorizer and Cosine Similarity
across movie descriptions, genres, and metadata tokens.
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class MovieRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.tfidf_matrix = None
        self.df = None

    def fit(self, df: pd.DataFrame) -> None:
        """
        Creates TF-IDF embeddings from combined text corpus: title, genres, and plot overview.
        """
        self.df = df.reset_index(drop=True).copy()
        
        # Combine text features with weighted genre repetition
        def build_soup(row):
            title = str(row.get('title', ''))
            genres = str(row.get('genres', ''))
            overview = str(row.get('overview', ''))
            # Repeat genre twice to amplify category matching
            return f"{title} {genres} {genres} {overview}".lower()

        soup = self.df.apply(build_soup, axis=1)
        self.tfidf_matrix = self.vectorizer.fit_transform(soup)

    def get_recommendations(self, title: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Returns the top N most similar movies to the query title with similarity scores.
        """
        if self.tfidf_matrix is None or self.df is None:
            return []

        # Locate movie in dataset
        matches = self.df[self.df['title'].str.lower() == title.lower()]
        if matches.empty:
            # Partial match fallback
            matches = self.df[self.df['title'].str.lower().str.contains(title.lower())]
            if matches.empty:
                return []

        idx = matches.index[0]
        target_vec = self.tfidf_matrix[idx]
        sim_scores = cosine_similarity(target_vec, self.tfidf_matrix).flatten()

        # Sort indices by similarity (excluding itself)
        ranked_indices = [i for i in np.argsort(-sim_scores) if i != idx][:top_n]

        results = []
        for i in ranked_indices:
            row = self.df.iloc[i]
            results.append({
                'title': row['title'],
                'genres': row['genres'],
                'rating': float(row['rating']),
                'release_year': int(row.get('release_year', 2020)),
                'similarity_score': round(float(sim_scores[i] * 100), 1),
                'overview': str(row.get('overview', ''))[:180] + '...'
            })

        return results
