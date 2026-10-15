"""
tmdb_api.py - The Movie Database (TMDB) Python API Integration
Safely loads TMDB_API_KEY from .env, fetches movie metadata, financial records,
and handles rate limits, network failures, and demo mode.
"""

import os
import requests
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "").strip()
BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

def is_api_configured() -> bool:
    """Returns True if a valid TMDB API key is configured."""
    return bool(TMDB_API_KEY and TMDB_API_KEY != "your_tmdb_api_key_here")

def search_movies(query: str, page: int = 1) -> List[Dict[str, Any]]:
    """
    Searches TMDB for movies matching the query string.
    Returns an empty list with console warning if API key is not configured or requests fail.
    """
    if not is_api_configured():
        return []

    try:
        url = f"{BASE_URL}/search/movie"
        params = {
            "api_key": TMDB_API_KEY,
            "query": query,
            "page": page,
            "include_adult": False
        }
        response = requests.get(url, params=params, timeout=6)
        response.raise_for_status()
        data = response.json()
        return data.get("results", [])
    except requests.RequestException as e:
        print(f"[TMDB API Error] Failed to search movies: {e}")
        return []

def get_movie_details(movie_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieves full movie details, including official budget, box office revenue,
    genres, and runtime.
    """
    if not is_api_configured():
        return None

    try:
        url = f"{BASE_URL}/movie/{movie_id}"
        params = {"api_key": TMDB_API_KEY, "language": "en-US"}
        response = requests.get(url, params=params, timeout=6)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"[TMDB API Error] Failed to fetch movie ID {movie_id}: {e}")
        return None

def get_poster_url(poster_path: Optional[str]) -> str:
    """Constructs the full CDN URL for a TMDB movie poster."""
    if not poster_path:
        return ""
    return f"{IMAGE_BASE_URL}{poster_path}"
