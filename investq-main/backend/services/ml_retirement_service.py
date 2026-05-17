# backend/services/ml_retirement_service.py
import joblib
import pandas as pd
import math
import os

class MLRetirementService:
    def __init__(self):
        current_dir = os.path.dirname(__file__)
        model_dir = os.path.join(current_dir, '..', 'ml_models')
        try:
            self.score_model = joblib.load(os.path.join(model_dir, 'retirement_score_model.pkl'))
            self.status_model = joblib.load(os.path.join(model_dir, 'retirement_status_model.pkl'))
            self.ai_active = True
        except:
            self.ai_active = False

    def _format_money(self, amount):
        if amount >= 10000000: return f"₹{amount/10000000:.2f} Crore"
        elif amount >= 100000: return f"₹{amount/100000:.2f} Lakh"
        else: return f"₹{amount:,.0f}"

    def predict_future(self, data):
        # 1. Exact Inputs
        age = int(data.get('age', 25))
        annual_income = float(data.get('annual_income', 1200000))
        current_savings = float(data.get('current_savings', 500000))
        monthly_sip = float(data.get('monthly_sip', 15000))
        epf_balance = float(data.get('epf_balance', 200000))
        ppf_contribution = float(data.get('ppf_contribution', 5000))
        nps_contribution = float(data.get('nps_contribution', 3000))
        risk_appetite = data.get('risk_appetite', 'Moderate')
        inflation_assumption = float(data.get('inflation_assumption', 6.0)) / 100
        monthly_expenses = float(data.get('monthly_expenses', 45000))
        dependents = int(data.get('dependents', 3))
        
        retirement_age = 60
        years_to_retire = retirement_age - age
        total_months = years_to_retire * 12
        
        # 2. Advanced Math Calculations
        market_return = 0.12 if risk_appetite == 'Aggressive' else 0.10 if risk_appetite == 'Moderate' else 0.08
        safe_withdrawal = 0.04
        
        future_expense = monthly_expenses * math.pow((1 + inflation_assumption), years_to_retire)
        required_corpus = (future_expense * 12) / safe_withdrawal
        
        fv_savings = (current_savings + epf_balance) * math.pow((1 + market_return), years_to_retire)
        monthly_rate = market_return / 12
        fv_sip = monthly_sip * ((math.pow((1 + monthly_rate), total_months) - 1) / monthly_rate) * (1 + monthly_rate)
        
        ppf_rate = 0.071 / 12
        fv_ppf = ppf_contribution * ((math.pow((1 + ppf_rate), total_months) - 1) / ppf_rate) * (1 + ppf_rate)
        
        nps_rate = 0.10 / 12
        fv_nps = nps_contribution * ((math.pow((1 + nps_rate), total_months) - 1) / nps_rate) * (1 + nps_rate)

        predicted_corpus = fv_savings + fv_sip + fv_ppf + fv_nps
        pension_estimate = (predicted_corpus * safe_withdrawal) / 12

        # 3. ML AI Predictions
        ai_score = 0
        ai_risk = "Unknown"
        
        if self.ai_active:
            risk_map = {'Conservative': 1, 'Moderate': 2, 'Aggressive': 3}
            risk_num = risk_map.get(risk_appetite, 2)
            
            input_df = pd.DataFrame([[
                age, annual_income, current_savings, monthly_sip, 
                epf_balance, (ppf_contribution * 12), nps_contribution, 
                inflation_assumption * 100, monthly_expenses, dependents, risk_num
            ]], columns=[
                'age', 'annual_income', 'current_savings', 'monthly_sip', 
                'epf_balance', 'ppf_balance', 'nps_contribution', 
                'inflation_rate', 'monthly_expenses', 'dependents', 'risk_appetite_num'
            ])
            
            ai_score = int(self.score_model.predict(input_df)[0])
            status = self.status_model.predict(input_df)[0]
            
            if status == "Not Ready": ai_risk = "High"
            elif status == "Partially Ready": ai_risk = "Moderate"
            else: ai_risk = "Low"

        # 4. Detailed Explanations & Roadmaps
        deficit = max(required_corpus - predicted_corpus, 0)
        
        # Graph Generation
        chart_data = []
        current_wealth = current_savings + epf_balance
        for a in range(age, retirement_age + 1):
            chart_data.append({
                "age": a,
                "projected_wealth": round(current_wealth, 2),
                "target_corpus": round(required_corpus, 2)
            })
            for _ in range(12):
                current_wealth = current_wealth * (1 + monthly_rate) + monthly_sip + ppf_contribution + nps_contribution
        
        # Graph Explanation
        graph_exp = f"This graph projects your wealth compounding at {market_return*100}% annually. The red dashed line is your required target of {self._format_money(required_corpus)}. The green line is your actual wealth. "
        if deficit > 0:
            graph_exp += f"Notice how your green line falls below the red line at age {retirement_age}, leaving a deficit of {self._format_money(deficit)}."
        else:
            graph_exp += "Notice how your green line beautifully crosses the red target line, meaning you will have surplus wealth!"

        return {
            "success": True,
            "outputs": {
                "score": f"{ai_score}/100",
                "risk": ai_risk,
                "predicted_corpus": self._format_money(predicted_corpus),
                "pension_estimate": f"{self._format_money(pension_estimate)}/month",
                "ai_main_suggestion": "Increase NPS contribution and shift 20% of FDs to Large Cap Equity." if ai_risk != "Low" else "Maintain current SIP momentum.",
                
                "detailed_explanation": {
                    "inflation_impact": f"Assuming {inflation_assumption*100}% inflation, your current ₹{monthly_expenses:,.0f} lifestyle will cost {self._format_money(future_expense)}/month by age {retirement_age}.",
                    "score_reason": f"Your score is {ai_score} because your savings rate (SIP + PPF + NPS) is currently fighting against a high dependency ratio ({dependents} dependents) and inflation. The ML model flagged your portfolio as '{ai_risk} Risk' because it is under-allocated for future compounding."
                },
                
                "graph_explanation": graph_exp,
                "chart_data": chart_data,
                
                "investment_roadmap": [
                    {"phase": "Immediate Action (Year 1)", "action": f"Increase Monthly NPS by ₹{max(3000, int(deficit/100000))} to secure extra ₹50k tax benefit under 80CCD(1B) and boost annuity pool."},
                    {"phase": "Accumulation (Age 30-45)", "action": "Step-up your Equity SIPs by 10% every year as your salary grows. Focus aggressively on wealth generation."},
                    {"phase": "Consolidation (Age 45-55)", "action": "Begin shifting high-risk Small-Cap equities into Balanced Advantage Funds to protect accumulated corpus."},
                    {"phase": "Pre-Retirement (Age 55-60)", "action": "Lock 60% of your total corpus into fixed-yield instruments (SCSS, Post Office, Bonds) to secure your guaranteed monthly pension."}
                ],
                
                "specific_suggestions": [
                    {"type": "Government Scheme", "name": "NPS Tier 1", "logic": "Mandatory for you. The lock-in ensures you don't break compounding, plus the 40% annuity guarantees base pension."},
                    {"type": "Equity/Stocks", "name": "Nifty 50 Index / ESG Bluechips", "logic": f"To hit your {self._format_money(required_corpus)} target, you need 12%+ returns. Highly rated ESG stocks (like Tata Power, HDFC) or a simple Nifty BeES ETF is required."},
                    {"type": "Debt Allocation", "name": "PPF (Public Provident Fund)", "logic": "Maximize your ₹1.5L annual limit here before doing normal FDs to get tax-free guaranteed 7.1% compounding."}
                ]
            }
        }