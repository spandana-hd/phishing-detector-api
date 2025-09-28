import os
import joblib
from typing import List

from .models import EmailInput, PredictionResult
from .utils import extract_urls, check_domain_mismatch

# --- ML Model Loading ---
MODEL_PATH = "model/phishing_model.pkl"
VECTORIZER_PATH = "model/vectorizer.pkl"
model, vectorizer = None, None

if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("✅ Model and vectorizer loaded successfully.")
else:
    print(f"⚠️ Warning: Model/Vectorizer not found at {MODEL_PATH}")

# --- Prediction Logic ---
def predict_single_email(email: EmailInput) -> PredictionResult:
    """
    Analyzes a single email and returns a detailed prediction result.
    """
    if model is None or vectorizer is None:
        return PredictionResult(
            prediction="error", confidence=0.0, suspicious_urls=[],
            domain_mismatch=False, reason=["ML model is not available."]
        )
    
    features = vectorizer.transform([email.text])
    prediction_val = model.predict(features)[0]
    confidence = model.predict_proba(features)[0].max()
    
    urls = extract_urls(email.text)
    domain_mismatch = check_domain_mismatch(email.from_email, email.reply_to)
    
    reason = []
    if len(urls) > 0:
        reason.append(f"Found {len(urls)} URL(s).")
    if domain_mismatch:
        reason.append("From and Reply-To domains mismatch.")
    
    return PredictionResult(
        prediction="phishing" if prediction_val == 1 else "legitimate",
        confidence=float(confidence),
        suspicious_urls=urls,
        domain_mismatch=domain_mismatch,
        reason=reason if reason else ["Standard analysis."]
    )