"""
ClassiNews - Flask API Server
Serves the trained ML model for news classification.

Usage:
    python app.py

Endpoints:
    GET  /           - Homepage
    POST /predict    - Classify news article
    GET  /dashboard  - Category dashboard
    GET  /categories - Get category metadata (JSON)
"""

import pickle
import re
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

# Download NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('punkt_tab', quiet=True)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize NLP tools
stemmer = PorterStemmer()
stop_words = set(stopwords.words('english'))

# Load model and vectorizer
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
    with open('categories.pkl', 'rb') as f:
        CATEGORIES = pickle.load(f)
    print("✓ Model loaded successfully")
except FileNotFoundError:
    print("⚠ Model files not found. Run model_training.py first.")
    model = None
    vectorizer = None
    CATEGORIES = {
        0: 'Politics',
        1: 'Sports',
        2: 'Business', 
        3: 'Technology',
        4: 'Entertainment',
        5: 'Health'
    }


def preprocess_text(text):
    """Preprocess input text for classification."""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = word_tokenize(text)
    processed_tokens = [
        stemmer.stem(token)
        for token in tokens
        if token not in stop_words and len(token) > 2
    ]
    return ' '.join(processed_tokens)


@app.route('/')
def home():
    """Render homepage."""
    return render_template('index.html')


@app.route('/dashboard')
def dashboard():
    """Render dashboard page."""
    return render_template('dashboard.html', categories=CATEGORIES)


@app.route('/predict', methods=['POST'])
def predict():
    """
    Classify a news article.
    
    Request body (JSON):
        { "text": "News article content..." }
    
    Response (JSON):
        { "category": "Technology", "confidence": 0.85 }
    """
    if model is None or vectorizer is None:
        return jsonify({
            'error': 'Model not loaded. Run model_training.py first.'
        }), 500
    
    # Get input from JSON or form data
    if request.is_json:
        data = request.get_json()
        text = data.get('text', '')
    else:
        text = request.form.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    # Preprocess and predict
    processed_text = preprocess_text(text)
    text_tfidf = vectorizer.transform([processed_text])
    
    # Get prediction and probability
    prediction = model.predict(text_tfidf)[0]
    probabilities = model.predict_proba(text_tfidf)[0]
    confidence = float(max(probabilities))
    
    category = CATEGORIES.get(prediction, 'Unknown')
    
    # For API requests (React frontend)
    if request.is_json:
        return jsonify({
            'category': category,
            'confidence': confidence
        })
    
    # For form submissions (Flask templates)
    return render_template('index.html', 
                         prediction=category, 
                         confidence=f"{confidence*100:.1f}%",
                         input_text=text)


@app.route('/categories', methods=['GET'])
def get_categories():
    """Get all category metadata."""
    category_data = {
        'Politics': {
            'description': 'Government, elections, policy, and international relations',
            'examples': [
                'Senate passes new infrastructure bill',
                'President announces climate initiative',
                'UN summit addresses global tensions'
            ]
        },
        'Sports': {
            'description': 'Athletic competitions, teams, and sporting events',
            'examples': [
                'Championship finals set for Sunday',
                'Star player signs record contract',
                'Olympics committee announces host city'
            ]
        },
        'Business': {
            'description': 'Markets, finance, companies, and economic news',
            'examples': [
                'Stock market reaches all-time high',
                'Major merger creates industry giant',
                'Central bank announces rate decision'
            ]
        },
        'Technology': {
            'description': 'Innovation, gadgets, software, and digital trends',
            'examples': [
                'AI startup raises $500M in funding',
                'New smartphone features unveiled',
                'Cybersecurity breach affects millions'
            ]
        },
        'Entertainment': {
            'description': 'Movies, music, celebrities, and pop culture',
            'examples': [
                'Blockbuster film breaks box office records',
                'Grammy nominations announced today',
                'Streaming service launches new series'
            ]
        },
        'Health': {
            'description': 'Medicine, wellness, healthcare, and research',
            'examples': [
                'Breakthrough treatment shows promise',
                'WHO releases new health guidelines',
                'Research links diet to longevity'
            ]
        }
    }
    
    return jsonify(list(category_data.items()))


@app.route('/health', methods=['GET'])
def health_check():
    """API health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'categories': list(CATEGORIES.values())
    })


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("ClassiNews Flask API Server")
    print("=" * 50)
    print("\nEndpoints:")
    print("  GET  /           - Homepage")
    print("  POST /predict    - Classify article")
    print("  GET  /dashboard  - Category dashboard")
    print("  GET  /categories - API: Get categories")
    print("  GET  /health     - API: Health check")
    print("\nStarting server on http://localhost:5000")
    print("=" * 50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
