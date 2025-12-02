# ClassiNews - Flask Backend

News Topic Classifier using Machine Learning (Multinomial Naive Bayes).

## Quick Start

```bash
# 1. Navigate to this directory
cd flask-backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train the model
python model_training.py

# 4. Start the server
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Homepage (HTML) |
| POST | `/predict` | Classify news article |
| GET | `/dashboard` | Category dashboard (HTML) |
| GET | `/categories` | Get category metadata (JSON) |
| GET | `/health` | API health check |

## Prediction API

**Request:**
```json
POST /predict
Content-Type: application/json

{
  "text": "Your news article text here..."
}
```

**Response:**
```json
{
  "category": "Technology",
  "confidence": 0.85
}
```

## Categories

- **Politics** - Government, elections, policy
- **Sports** - Athletic competitions, teams
- **Business** - Markets, finance, companies
- **Technology** - Innovation, gadgets, software
- **Entertainment** - Movies, music, celebrities
- **Health** - Medicine, wellness, healthcare

## Model Details

- **Algorithm:** Multinomial Naive Bayes
- **Features:** TF-IDF Vectorizer (5000 features, 1-2 ngrams)
- **Preprocessing:** NLTK (lowercase, stopwords, PorterStemmer)
- **Dataset:** AG News (or sample data)
- **Train/Test Split:** 80/20

## File Structure

```
flask-backend/
├── app.py              # Flask server
├── model_training.py   # Model training script
├── model.pkl          # Trained model (generated)
├── vectorizer.pkl     # TF-IDF vectorizer (generated)
├── categories.pkl     # Category mapping (generated)
├── requirements.txt   # Python dependencies
├── templates/
│   ├── index.html     # Homepage template
│   └── dashboard.html # Dashboard template
└── static/
    └── style.css      # Styles
```

## Connecting to React Frontend

The React frontend expects the API at `http://localhost:5000` by default.

To use a different URL, set the `VITE_API_URL` environment variable in your React app.
