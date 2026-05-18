import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

print("🧠 Starting Financial Health AI Training...")

# 1. Load the dataset
df = pd.read_csv('C:/Users/Ganesh/Desktop/Investq - react/investq-main/backend/financial_health_score_dataset_2000.csv')

# 2. Define Inputs (Features) and Targets
features = [
    'savings_ratio', 'total_debt', 'emi_per_month', 'insurance_coverage', 
    'emergency_fund', 'total_investments', 'income_stability', 
    'monthly_expenses', 'retirement_savings'
]

targets = ['financial_health_score', 'financial_risk_level', 'savings_quality']

X = df[features].copy()
y_score = df['financial_health_score']
y_risk = df['financial_risk_level']
y_savings = df['savings_quality']

# 3. Encode Categorical Data
# Input Encoder
stability_encoder = LabelEncoder()
X['income_stability'] = stability_encoder.fit_transform(X['income_stability'])

# Target Encoders
risk_encoder = LabelEncoder()
savings_encoder = LabelEncoder()
y_risk_encoded = risk_encoder.fit_transform(y_risk)
y_savings_encoded = savings_encoder.fit_transform(y_savings)

# 4. Train-Test Split
X_train, X_test, ys_train, ys_test, yr_train, yr_test, ysq_train, ysq_test = train_test_split(
    X, y_score, y_risk_encoded, y_savings_encoded, test_size=0.2, random_state=42
)

# 5. Train Models
print("⚙️ Training Financial Health Score Model (Random Forest Regressor)...")
score_model = RandomForestRegressor(n_estimators=100, random_state=42)
score_model.fit(X_train, ys_train)

print("⚙️ Training Financial Risk Model (Gradient Boosting Classifier)...")
risk_model = GradientBoostingClassifier(n_estimators=100, random_state=42)
risk_model.fit(X_train, yr_train)

print("⚙️ Training Savings Quality Model (Random Forest Classifier)...")
savings_model = RandomForestClassifier(n_estimators=100, random_state=42)
savings_model.fit(X_train, ysq_train)

# 6. Save Models and Encoders
os.makedirs('ml_models', exist_ok=True)

joblib.dump(score_model, 'ml_models/health_score_model.pkl')
joblib.dump(risk_model, 'ml_models/health_risk_model.pkl')
joblib.dump(savings_model, 'ml_models/savings_quality_model.pkl')

joblib.dump(stability_encoder, 'ml_models/stability_encoder.pkl')
joblib.dump(risk_encoder, 'ml_models/risk_encoder.pkl')
joblib.dump(savings_encoder, 'ml_models/savings_encoder.pkl')

print("✅ Training Complete! All models and encoders saved to 'ml_models/' directory.")