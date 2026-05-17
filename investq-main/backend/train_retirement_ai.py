# backend/train_retirement_ai.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
import joblib
import os

print("🧠 Starting AI Training process with Advanced Features...")

# 1. Load the dataset
df = pd.read_csv('C:/Users/Ganesh/Desktop/Investq - react/investq-main/backend/retirement_readiness_dataset_1000.csv')

# 2. Convert text data into numbers for the AI (Risk Appetite)
risk_map = {'Conservative': 1, 'Moderate': 2, 'Aggressive': 3}
df['risk_appetite_num'] = df['risk_appetite'].map(risk_map).fillna(2) # Default to Moderate if empty

# 3. Select the exact features requested
features = [
    'age', 'annual_income', 'current_savings', 'monthly_sip', 
    'epf_balance', 'ppf_balance', 'nps_contribution', 
    'inflation_rate', 'monthly_expenses', 'dependents', 'risk_appetite_num'
]

X = df[features]
y_score = df['retirement_readiness_score']
y_status = df['retirement_status']

# 4. Split and Train
X_train, X_test, ys_train, ys_test = train_test_split(X, y_score, test_size=0.2, random_state=42)
X_train, X_test, yst_train, yst_test = train_test_split(X, y_status, test_size=0.2, random_state=42)

print("🌲 Training Random Forest Models...")
score_model = RandomForestRegressor(n_estimators=100, random_state=42)
score_model.fit(X_train, ys_train)

status_model = RandomForestClassifier(n_estimators=100, random_state=42)
status_model.fit(X_train, yst_train)

# 5. Save the Brains
os.makedirs('ml_models', exist_ok=True)
joblib.dump(score_model, 'ml_models/retirement_score_model.pkl')
joblib.dump(status_model, 'ml_models/retirement_status_model.pkl')

print("✅ AI Training Complete! Advanced Brains saved.")