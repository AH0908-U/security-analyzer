import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

SAMPLE_DATA = [
    ("Urgent: Your account has been compromised. Click here to verify your identity immediately.", 1),
    ("Dear customer, your PayPal account has been limited due to suspicious activity.", 1),
    ("You have won $1,000,000! Claim your prize now by sending us your bank details.", 1),
    ("We detected unusual login from unknown device. Verify your account now.", 1),
    ("Your invoice is attached. Please process payment ASAP.", 1),
    ("Click here to update your billing information and avoid service interruption.", 1),
    ("Your Netflix subscription has expired. Update payment to continue watching.", 1),
    ("Security alert: Someone tried to access your account from Russia.", 1),
    ("Dear user, your email storage is full. Upgrade now to avoid deletion.", 1),
    ("Important: IRS tax refund available. Claim your $1,280 refund today.", 1),
    ("Hi team, the Q3 report is attached for review. Let me know if you have questions.", 0),
    ("Your order #28472 has shipped. Track it here: https://shop.example.com/track", 0),
    ("Meeting rescheduled to 3pm tomorrow. Please confirm your availability.", 0),
    ("Password reset requested. If this was you, click here: https://app.example.com/reset", 0),
    ("Your flight to New York is confirmed. Boarding pass attached.", 0),
    ("Thank you for subscribing to our newsletter. Welcome aboard!", 0),
    ("Your package will be delivered tomorrow between 9am-5pm.", 0),
    ("John shared a document with you on Google Docs.", 0),
    ("Your monthly statement is ready. View it securely in your dashboard.", 0),
    ("The server maintenance is scheduled for Saturday 2am-6am EST.", 0),
    ("URGENT: Your account will be SUSPENDED if you do not verify your identity in 24 hours!!!", 1),
    ("Verify Your Account Now - Suspension Notice - Action Required", 1),
    ("Congratulations! You've been selected for a free iPhone. Claim now!", 1),
    ("We need you to confirm your social security number for verification purposes.", 1),
    ("Your Amazon order could not be processed. Update payment method.", 1),
    ("Can you review the attached proposal before our meeting on Friday?", 0),
    ("Your support ticket #88421 has been resolved. Rate our service.", 0),
    ("The quarterly earnings report is published on the investor portal.", 0),
    ("Please find attached the signed contract for your records.", 0),
    ("Reminder: Your performance review is scheduled for next Tuesday.", 0),
]

def train():
    texts = [s[0] for s in SAMPLE_DATA]
    labels = [s[1] for s in SAMPLE_DATA]

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 3), stop_words="english")
    X = vectorizer.fit_transform(texts)

    X_train, X_test, y_train, y_test = train_test_split(X, labels, test_size=0.3, random_state=42)

    model = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))

    model_dir = os.path.dirname(os.path.abspath(__file__))
    joblib.dump(model, os.path.join(model_dir, "phishing_model.pkl"))
    joblib.dump(vectorizer, os.path.join(model_dir, "nlp_pipeline.pkl"))
    print(f"\nModels saved to {model_dir}")

if __name__ == "__main__":
    train()
