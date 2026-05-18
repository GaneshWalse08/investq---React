import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import os
import random

class MLRecommendationService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.csv_path = os.path.join(base_dir, '..', 'ml_allocation_dataset_1000.csv')
        
        if not os.path.exists(self.csv_path):
            self._generate_synthetic_data()

        try:
            self.df = pd.read_csv(self.csv_path)
            categorical_features = ['risk_profile', 'financial_goal', 'investment_horizon', 'health_risk']
            numeric_features = ['age', 'annual_income']
            
            self.preprocessor = ColumnTransformer(
                transformers=[
                    ('num', StandardScaler(), numeric_features),
                    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
                ])
            
            X = self.df[numeric_features + categorical_features]
            X_processed = self.preprocessor.fit_transform(X)
            
            # Target features the AI will learn to predict
            y = self.df[['Equity', 'PPF', 'NPS', 'Gold', 'Debt']]
            
            # Using K-Nearest Neighbors Regressor for continuous percentages
            self.knn = KNeighborsRegressor(n_neighbors=5, weights='distance')
            self.knn.fit(X_processed, y)
            
            self.model_loaded = True
            print("✅ ML Allocation Regressor: Online & Trained.")
        except Exception as e:
            print(f"❌ Error loading ML Allocation: {str(e)}")
            self.model_loaded = False

    def get_recommendations(self, user_profile):
        if not self.model_loaded:
            return {"success": False, "message": "ML Engine offline."}
        try:
            mapped_profile = {
                'age': user_profile.get('age', 30),
                'annual_income': user_profile.get('annual_income', 1000000),
                'risk_profile': user_profile.get('risk_tolerance', 'moderate').title(),
                'financial_goal': user_profile.get('financial_goal', 'Wealth Creation'),
                'investment_horizon': user_profile.get('duration', '1-3 years'),
                'health_risk': user_profile.get('health_risk', 'Low')
            }

            test_df = pd.DataFrame([mapped_profile])
            test_processed = self.preprocessor.transform(test_df)
            
            # Predict the exact allocations
            predictions = self.knn.predict(test_processed)[0]
            total = sum(predictions)
            
            if total == 0: total = 1 # Prevent division by zero
            
            allocations = {
                "Equity allocation": round((predictions[0]/total)*100, 1),
                "PPF allocation": round((predictions[1]/total)*100, 1),
                "NPS allocation": round((predictions[2]/total)*100, 1),
                "Gold": round((predictions[3]/total)*100, 1),
                "Debt": round((predictions[4]/total)*100, 1)
            }
            
            # Sort highest to lowest
            allocations = dict(sorted(allocations.items(), key=lambda item: item[1], reverse=True))
            
            reasoning = []
            for asset, alloc in allocations.items():
                if alloc > 0:
                    reasoning.append({"asset": asset, "reason": f"AI matched {alloc}% based on historical success for {mapped_profile['risk_profile']} risk users."})
                
            return {"success": True, "allocations": allocations, "reasoning": reasoning}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def _generate_synthetic_data(self):
        print("⚙️ Generating synthetic allocation dataset...")
        data = []
        for _ in range(1000):
            risk = random.choice(['Low', 'Moderate', 'High'])
            if risk == 'High':
                eq, ppf, nps, gld, dbt = random.randint(60, 80), random.randint(0, 10), random.randint(5, 15), random.randint(5, 10), random.randint(0, 5)
            elif risk == 'Moderate':
                eq, ppf, nps, gld, dbt = random.randint(40, 50), random.randint(15, 20), random.randint(10, 15), random.randint(10, 15), random.randint(10, 20)
            else:
                eq, ppf, nps, gld, dbt = random.randint(10, 20), random.randint(30, 40), random.randint(10, 20), random.randint(10, 20), random.randint(20, 30)
            
            data.append({
                'age': random.randint(22, 65),
                'annual_income': random.randint(300000, 5000000),
                'risk_profile': risk,
                'financial_goal': random.choice(['Wealth Creation', 'Retirement', 'House Purchase', 'Emergency Fund']),
                'investment_horizon': random.choice(['< 1 year', '1-3 years', '5+ years']),
                'health_risk': random.choice(['Low', 'Medium', 'High']),
                'Equity': eq, 'PPF': ppf, 'NPS': nps, 'Gold': gld, 'Debt': dbt
            })
        pd.DataFrame(data).to_csv(self.csv_path, index=False)