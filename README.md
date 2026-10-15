# CineMetrics – Movie Analytics Dashboard
*A modern, data-driven film industry intelligence platform and machine learning suite.*

Designed for academic presentations, data science coursework, and industry portfolio reviews. Built with Python, Streamlit, pandas, NumPy, scikit-learn, Plotly, and TMDB API.

---

## 🌟 Key Features

1. **Executive Cinema Intelligence Dashboard**:
   - High-impact KPI cards: Total movies, average rating, highest-grossing film, total box office volume, release span.
   - Global box office trends and market dynamics.
   - Interactive data visualizations styled in dark navy and warm gold accents.

2. **Movie Catalog & Comparative Explorer**:
   - Real-time search across titles, directors, and plot overviews.
   - Multi-criteria filtering by genre, release year, minimum rating, and language.
   - Side-by-side comparative inspection between multiple films.

3. **Genre Performance & ROI Breakdown**:
   - Genre market share donut charts and revenue aggregations.
   - Average ratings, box office gross, and popularity metrics grouped by genre.

4. **Box Office & Financial Risk Analysis**:
   - Top 10 highest-grossing movies worldwide.
   - Interactive Production Budget vs. Worldwide Revenue scatter plot with $y = x$ Break-Even reference line.
   - Four-tier financial risk categorization: *Blockbuster Hit*, *Profitable Asset*, *Moderate Break-Even*, and *Box Office Deficit*.

5. **Machine Learning Engines (scikit-learn)**:
   - **Box Office Revenue Prediction**: Regularized Ridge Regression trained on budget, runtime, release year, and genres. Features 80/20 train/test evaluation with real $R^2$, MAE, and RMSE metrics. Includes an interactive playground to forecast revenue for new movie ideas.
   - **Content-Based Movie Recommender**: Natural language processing with TF-IDF vectorization and Cosine Similarity across plots, tags, and genres.
   - **Success Score Model**: Multi-attribute ranking blending critic ratings, box office ROI, and audience reach.

6. **Dataset Health Auditor & CSV Ingestion**:
   - Upload any custom CSV containing movie attributes.
   - Automatic schema validation, duplicate detection, and missing-data health scoring.
   - One-click filtered CSV exports and executive text reports.

7. **The Movie Database (TMDB) Integration**:
   - Connect live TMDB API key to search any film released worldwide.
   - Seamless, curated offline demo fallback when no API key is provided.

---

## 🛠️ Technology Stack

| Category | Tools & Libraries |
| :--- | :--- |
| **Frontend UI** | Streamlit, Custom Dark Cinema CSS, React 19 / Vite Web Applet |
| **Data Processing** | pandas, NumPy |
| **Data Visualization** | Plotly, Matplotlib, Seaborn |
| **Machine Learning** | scikit-learn (Ridge Regression, TF-IDF, Cosine Similarity) |
| **External APIs** | The Movie Database (TMDB) API v3, Requests |
| **Environment** | python-dotenv |

---

## 🚀 Step-by-Step Installation & Local Execution (VS Code)

### Prerequisites
- Python 3.9, 3.10, or 3.11 installed on your system.
- Git and Visual Studio Code (optional, but recommended).

### Step 1: Open Terminal / Clone Repository
Open your project folder in VS Code (`File > Open Folder...`). Open a new terminal (`Ctrl + ~` or `Terminal > New Terminal`).

### Step 2: Create and Activate Virtual Environment
```bash
# On macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# On Windows (Command Prompt):
python -m venv venv
.\venv\Scripts\activate.bat
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and add your free TMDB API Key (optional):
```env
TMDB_API_KEY="your_actual_tmdb_api_key_here"
```
*(Note: If left empty, CineMetrics runs automatically in Curated Demo Mode with 25+ real blockbuster records).*

### Step 5: Launch the Streamlit Dashboard
```bash
streamlit run app.py
```
Streamlit will launch locally at `http://localhost:8501`.

---

## 📊 Project File Structure

```
├── app.py                  # Main Streamlit web application & routing
├── data_analysis.py        # pandas data cleaning, KPIs, and audit logic
├── visualizations.py       # Plotly interactive charting functions
├── prediction.py           # scikit-learn ML regression pipeline
├── recommendations.py      # TF-IDF cosine similarity movie recommender
├── tmdb_api.py             # TMDB REST API client & dotenv loader
├── requirements.txt        # Python dependency manifest
├── .env.example            # Environment configuration template
├── README.md               # Detailed academic project documentation
└── data/
    └── movies.csv          # Curated reference movie dataset
```

---

## 🎓 College Presentation & Viva Guide

- **Problem Statement**: The film industry involves high-stakes capital investments with uncertain returns. CineMetrics offers data-backed decision support by analyzing historic performance and predicting box office revenue.
- **Machine Learning Methodology**:
  - *Data Preprocessing*: Features (Budget, Runtime, Release Year) are standardized using `StandardScaler`. Categorical genres are encoded with `OneHotEncoder`. Log transformation ($\log_{10}$) is applied to revenue to normalize skewed distributions.
  - *Model Training*: Ridge Regression with $L_2$ regularization prevents overfitting on high-budget outliers.
  - *Evaluation*: Model performance is measured using $R^2$ score and Mean Absolute Error (MAE).
  - *NLP Recommender*: Movie overviews and genres are transformed into TF-IDF term vectors, and similarity is scored using Cosine Similarity:
    $$\text{Cosine Similarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

---

Developed with ❤️ for Cinephiles, Data Scientists, and Film Executives.
