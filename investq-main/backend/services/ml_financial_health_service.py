import os
import joblib
import pandas as pd

class MLFinancialHealthService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        models_dir = os.path.join(base_dir, 'ml_models')
        
        try:
            # Load Models
            self.score_model = joblib.load(os.path.join(models_dir, 'health_score_model.pkl'))
            self.risk_model = joblib.load(os.path.join(models_dir, 'health_risk_model.pkl'))
            self.savings_model = joblib.load(os.path.join(models_dir, 'savings_quality_model.pkl'))
            
            # Load Encoders
            self.stability_encoder = joblib.load(os.path.join(models_dir, 'stability_encoder.pkl'))
            self.risk_encoder = joblib.load(os.path.join(models_dir, 'risk_encoder.pkl'))
            self.savings_encoder = joblib.load(os.path.join(models_dir, 'savings_encoder.pkl'))
            self.models_loaded = True
        except Exception as e:
            print(f"⚠️ Could not load Financial Health ML Models: {e}")
            self.models_loaded = False

    def predict_health(self, user_data):
        if not self.models_loaded:
            return {"error": "ML Models not initialized. Please run train_financial_health_ai.py first."}

        try:
            # Encode categorical input gracefully (handle unknown labels)
            stability_val = user_data.get('income_stability', 'Moderate')
            if stability_val not in self.stability_encoder.classes_:
                stability_val = self.stability_encoder.classes_[0] # fallback

            encoded_stability = self.stability_encoder.transform([stability_val])[0]

            # Prepare Input array matching training features
            input_df = pd.DataFrame([{
                'savings_ratio': float(user_data.get('savings_ratio', 0)),
                'total_debt': float(user_data.get('total_debt', 0)),
                'emi_per_month': float(user_data.get('emi_per_month', 0)),
                'insurance_coverage': float(user_data.get('insurance_coverage', 0)),
                'emergency_fund': float(user_data.get('emergency_fund', 0)),
                'total_investments': float(user_data.get('total_investments', 0)),
                'income_stability': encoded_stability,
                'monthly_expenses': float(user_data.get('monthly_expenses', 0)),
                'retirement_savings': float(user_data.get('retirement_savings', 0))
            }])

            # Generate Predictions
            score_pred = self.score_model.predict(input_df)[0]
            risk_pred_encoded = self.risk_model.predict(input_df)[0]
            savings_pred_encoded = self.savings_model.predict(input_df)[0]

            # Decode Categorical Outputs
            risk_label = self.risk_encoder.inverse_transform([risk_pred_encoded])[0]
            savings_label = self.savings_encoder.inverse_transform([savings_pred_encoded])[0]

            return {
                "success": True,
                "financial_health_score": round(score_pred, 1),
                "financial_risk_level": risk_label,
                "savings_quality": savings_label
            }

        except Exception as e:
            return {"success": False, "message": f"Prediction failed: {str(e)}"}