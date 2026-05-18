import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, classification_report

# 1. Load Data
df = pd.read_csv('personalized_investment_recommendation_dataset_1000.csv')
df['tax_bracket'] = df['tax_bracket'].str.replace('%', '').astype(float)

# 2. Define Features and Target
X = df[['age', 'annual_income', 'tax_bracket', 'risk_profile', 'financial_goal', 'investment_horizon', 'esg_preference', 'health_risk']]
y = df['recommended_investments'] # What we are trying to predict

# 3. Preprocess (Convert text to numbers)
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['age', 'annual_income', 'tax_bracket']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['risk_profile', 'financial_goal', 'investment_horizon', 'esg_preference', 'health_risk'])
    ])
X_processed = preprocessor.fit_transform(X)

# 4. TRAIN / TEST SPLIT (80% Train, 20% Test)
X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42)

# 5. Train the Model on the 80%
print("🧠 Training ML Model on 800 users...")
classifier = KNeighborsClassifier(n_neighbors=15)
classifier.fit(X_train, y_train)

# 6. Test the Model on the 20% it has never seen before
print("🧪 Testing ML Model on 200 hidden users...")
predictions = classifier.predict(X_test)

# 7. Print the Score
accuracy = accuracy_score(y_test, predictions)
print(f"✅ Model Accuracy Score: {accuracy * 100:.2f}%\n")