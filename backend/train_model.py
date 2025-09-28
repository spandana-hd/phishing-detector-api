import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib
import os

# Example dataset (replace with real emails later)
data = {
    "text": [
        "Update your password immediately http://fakebank.com",
        "Win a free iPhone, click here!",
        "Your invoice from Amazon is attached.",
        "Please confirm your leave request",
        "Suspicious login detected, verify now!"
    ],
    "label": [1, 1, 0, 0, 1]  # 1 = phishing, 0 = legitimate
}

df = pd.DataFrame(data)

# Train/Test split
X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["label"], test_size=0.2, random_state=42
)

# Text vectorization
vectorizer = TfidfVectorizer(stop_words="english")
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Model
model = LogisticRegression()
model.fit(X_train_vec, y_train)

# Evaluation
y_pred = model.predict(X_test_vec)
print(classification_report(y_test, y_pred))

# Save model and vectorizer
os.makedirs("model", exist_ok=True)
joblib.dump(model, "model/phishing_model.pkl")
joblib.dump(vectorizer, "model/vectorizer.pkl")

print("✅ Model training complete. Files saved in 'model/' folder.")

