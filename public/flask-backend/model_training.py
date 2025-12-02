"""
ClassiNews - Model Training Script
Trains a Multinomial Naive Bayes classifier for news categorization.

Usage:
    python model_training.py

This script will:
1. Load and preprocess AG News dataset (or sample data)
2. Train a MultinomialNB model
3. Save model.pkl and vectorizer.pkl
"""

import pickle
import re
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report

import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('punkt_tab', quiet=True)

# Initialize stemmer and stopwords
stemmer = PorterStemmer()
stop_words = set(stopwords.words('english'))

# Category mapping (AG News uses 1-4, we extend to 6 categories)
CATEGORIES = {
    0: 'Politics',
    1: 'Sports', 
    2: 'Business',
    3: 'Technology',
    4: 'Entertainment',
    5: 'Health'
}

def preprocess_text(text):
    """
    Preprocess text by:
    - Converting to lowercase
    - Removing special characters
    - Tokenizing
    - Removing stopwords
    - Applying Porter Stemmer
    """
    # Lowercase
    text = text.lower()
    
    # Remove special characters and digits
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and stem
    processed_tokens = [
        stemmer.stem(token) 
        for token in tokens 
        if token not in stop_words and len(token) > 2
    ]
    
    return ' '.join(processed_tokens)


def create_sample_dataset():
    """
    Create a sample dataset for training if AG News is not available.
    In production, replace this with actual AG News dataset loading.
    """
    sample_data = [
        # Politics
        ("Senate passes new legislation on healthcare reform", 0),
        ("President announces new foreign policy initiative", 0),
        ("Election results show close race in swing states", 0),
        ("Congress debates infrastructure spending bill", 0),
        ("UN Security Council meets to discuss international crisis", 0),
        ("Governor signs executive order on climate action", 0),
        ("Political parties clash over budget negotiations", 0),
        ("Supreme Court ruling affects voting rights", 0),
        
        # Sports
        ("Lakers win championship in overtime thriller", 1),
        ("World Cup finals draw record television audience", 1),
        ("Tennis star announces retirement from professional play", 1),
        ("Olympic committee selects host city for games", 1),
        ("Baseball team signs star player to record contract", 1),
        ("Soccer match ends in controversial penalty decision", 1),
        ("Golf tournament suspended due to weather conditions", 1),
        ("Boxing champion defends title in unanimous decision", 1),
        
        # Business
        ("Stock market reaches all-time high amid economic optimism", 2),
        ("Major tech companies announce merger agreement", 2),
        ("Federal Reserve announces interest rate decision", 2),
        ("Retail sales surge during holiday shopping season", 2),
        ("Startup raises millions in venture capital funding", 2),
        ("Oil prices fluctuate amid global supply concerns", 2),
        ("Housing market shows signs of cooling in major cities", 2),
        ("Corporate earnings exceed analyst expectations", 2),
        
        # Technology
        ("Apple unveils new iPhone with advanced AI features", 3),
        ("SpaceX successfully launches satellite constellation", 3),
        ("Artificial intelligence breakthrough in medical diagnosis", 3),
        ("Cybersecurity experts warn of new ransomware threat", 3),
        ("Electric vehicle sales continue rapid growth trend", 3),
        ("Social media platform introduces new privacy features", 3),
        ("Quantum computer achieves computational milestone", 3),
        ("Tech giants invest billions in data center expansion", 3),
        
        # Entertainment
        ("Blockbuster film breaks opening weekend records", 4),
        ("Grammy Awards ceremony celebrates music achievements", 4),
        ("Streaming service announces new original series lineup", 4),
        ("Celebrity couple announces engagement on social media", 4),
        ("Broadway show receives critical acclaim on opening night", 4),
        ("Music festival attracts thousands of fans worldwide", 4),
        ("Award-winning director reveals upcoming movie project", 4),
        ("Television series finale draws record viewership", 4),
        
        # Health
        ("New vaccine shows promising results in clinical trials", 5),
        ("WHO releases updated guidelines on disease prevention", 5),
        ("Research links diet and exercise to longevity", 5),
        ("Hospital implements innovative treatment for cancer patients", 5),
        ("Mental health awareness campaign launches nationwide", 5),
        ("Scientists discover potential cure for rare disease", 5),
        ("Healthcare workers receive recognition for pandemic response", 5),
        ("Study reveals benefits of meditation for stress reduction", 5),
    ]
    
    texts = [item[0] for item in sample_data]
    labels = [item[1] for item in sample_data]
    
    return pd.DataFrame({'text': texts, 'label': labels})


def train_model():
    """
    Train the news classification model.
    """
    print("=" * 50)
    print("ClassiNews - Model Training")
    print("=" * 50)
    
    # Load dataset
    print("\n[1/5] Loading dataset...")
    try:
        # Try to load AG News dataset if available
        df = pd.read_csv('ag_news_train.csv', header=None, names=['label', 'title', 'description'])
        df['text'] = df['title'] + ' ' + df['description']
        # Map AG News labels (1-4) to our categories
        df['label'] = df['label'].map({1: 0, 2: 1, 3: 2, 4: 3})  # World->Politics, Sports, Business, Sci/Tech
        print(f"  Loaded AG News dataset with {len(df)} samples")
    except FileNotFoundError:
        print("  AG News dataset not found, using sample data...")
        df = create_sample_dataset()
        print(f"  Created sample dataset with {len(df)} samples")
    
    # Preprocess text
    print("\n[2/5] Preprocessing text...")
    df['processed_text'] = df['text'].apply(preprocess_text)
    print("  Text preprocessing complete")
    
    # Split dataset
    print("\n[3/5] Splitting dataset (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        df['processed_text'], 
        df['label'], 
        test_size=0.2, 
        random_state=42,
        stratify=df['label']
    )
    print(f"  Training samples: {len(X_train)}")
    print(f"  Testing samples: {len(X_test)}")
    
    # Create TF-IDF vectorizer
    print("\n[4/5] Training TF-IDF vectorizer and model...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )
    
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # Train Multinomial Naive Bayes
    model = MultinomialNB(alpha=0.1)
    model.fit(X_train_tfidf, y_train)
    print("  Model training complete")
    
    # Evaluate model
    print("\n[5/5] Evaluating model...")
    y_pred = model.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n  Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    print("\n  Classification Report:")
    print("-" * 50)
    report = classification_report(y_test, y_pred, target_names=[CATEGORIES[i] for i in sorted(df['label'].unique())])
    print(report)
    
    # Save model and vectorizer
    print("\nSaving model and vectorizer...")
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("  Saved: model.pkl")
    
    with open('vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    print("  Saved: vectorizer.pkl")
    
    # Save categories mapping
    with open('categories.pkl', 'wb') as f:
        pickle.dump(CATEGORIES, f)
    print("  Saved: categories.pkl")
    
    print("\n" + "=" * 50)
    print("Training complete! Files saved:")
    print("  - model.pkl")
    print("  - vectorizer.pkl") 
    print("  - categories.pkl")
    print("=" * 50)
    
    return model, vectorizer


if __name__ == '__main__':
    train_model()
