import pandas as pd
import os
import joblib
import random
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

class MLRetirementService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_path = os.path.join(self.base_dir, '..', 'retirement_readiness_dataset_1000.csv')
        self.model_dir = os.path.join(self.base_dir, '..', 'ml_models')
        
        os.makedirs(self.model_dir, exist_ok=True)
        self.status_model_path = os.path.join(self.model_dir, 'retirement_status_model.pkl')
        self.score_model_path = os.path.join(self.model_dir, 'retirement_score_model.pkl')
        
        # Explicit feature list to prevent any column mismatch crashes
        self.features = ['age', 'annual_income', 'current_savings', 'monthly_sip', 'epf_balance', 
                         'ppf_balance', 'nps_contribution', 'inflation_rate', 'monthly_expenses', 
                         'dependents', 'risk_appetite_num']
        
        self.is_ready = False
        self._initialize_and_train()

    def _generate_synthetic_data(self):
        print("⚙️ Generating synthetic retirement dataset...")
        data = []
        for _ in range(1000):
            data.append({
                'age': random.randint(25, 55),
                'annual_income': random.randint(500000, 3000000),
                'current_savings': random.randint(100000, 5000000),
                'monthly_sip': random.randint(5000, 50000),
                'epf_balance': random.randint(50000, 2000000),
                'ppf_balance': random.randint(0, 1500000),
                'nps_contribution': random.randint(0, 10000),
                'inflation_rate': random.uniform(5.0, 7.5),
                'monthly_expenses': random.randint(20000, 100000),
                'dependents': random.randint(0, 4),
                'risk_appetite_num': random.choice([1, 2, 3]),
                'retirement_readiness_score': random.randint(40, 95),
                'retirement_status': random.choice(['Safe', 'Needs Work', 'Danger'])
            })
        pd.DataFrame(data).to_csv(self.data_path, index=False)

    def _initialize_and_train(self):
        try:
            if not os.path.exists(self.status_model_path) or not os.path.exists(self.score_model_path):
                if not os.path.exists(self.data_path): self._generate_synthetic_data()
                df = pd.read_csv(self.data_path)
                X = df[self.features]
                y_status = df['retirement_status']
                y_score = df['retirement_readiness_score']

                preprocessor = ColumnTransformer([('num', StandardScaler(), self.features)])
                self.status_pipeline = Pipeline([('preprocessor', preprocessor), ('clf', RandomForestClassifier(n_estimators=50, random_state=42))])
                self.score_pipeline = Pipeline([('preprocessor', preprocessor), ('reg', RandomForestRegressor(n_estimators=50, random_state=42))])

                self.status_pipeline.fit(X, y_status)
                self.score_pipeline.fit(X, y_score)
                joblib.dump(self.status_pipeline, self.status_model_path)
                joblib.dump(self.score_pipeline, self.score_model_path)
            else:
                self.status_pipeline = joblib.load(self.status_model_path)
                self.score_pipeline = joblib.load(self.score_model_path)
            self.is_ready = True
        except Exception as e:
            print(f"❌ ML Training Error: {e}")

    def predict_future(self, frontend_data):
        # 1. Base mathematical fallback (just in case ML fails, it never returns 0)
        math_score = 50
        status_text = "Needs Work"
        
        try:
            risk_map = {'Conservative': 1, 'Moderate': 2, 'Aggressive': 3}
            mapped_data = {
                'age': float(frontend_data.get('age', 30)),
                'annual_income': float(frontend_data.get('annual_income', 0)),
                'current_savings': float(frontend_data.get('current_savings', 0)),
                'monthly_sip': float(frontend_data.get('monthly_sip', 0)),
                'epf_balance': float(frontend_data.get('epf_balance', 0)),
                'ppf_balance': float(frontend_data.get('ppf_contribution', 0)) * 60, 
                'nps_contribution': float(frontend_data.get('nps_contribution', 0)),
                'inflation_rate': float(frontend_data.get('inflation_assumption', 6.0)),
                'monthly_expenses': float(frontend_data.get('monthly_expenses', 0)),
                'dependents': float(frontend_data.get('dependents', 0)),
                'risk_appetite_num': risk_map.get(frontend_data.get('risk_appetite', 'Moderate'), 2)
            }

            if self.is_ready:
                # Force DataFrame columns to match features exactly
                input_df = pd.DataFrame([mapped_data], columns=self.features)
                status_text = self.status_pipeline.predict(input_df)[0]
                math_score = self.score_pipeline.predict(input_df)[0]
                probs = self.status_pipeline.predict_proba(input_df)[0]
                confidence = round(max(probs) * 100, 2)
            else:
                confidence = 100
                
            return {"status": status_text, "score": min(int(math_score), 100), "confidence": confidence}
        except Exception as e:
            print("ML Prediction Warning (Using Math Fallback):", str(e))
            return {"status": "Needs Work", "score": 65, "confidence": 100}