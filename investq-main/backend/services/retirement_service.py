import math
import sqlite3
import json
import os
from services.ml_retirement_service import MLRetirementService

class RetirementService:
    def __init__(self):
        self.ml_service = MLRetirementService()
        # ABSOLUTE path to avoid missing DB issues
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'esg_users.db'))
        self._init_db()

    def _init_db(self):
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute('''CREATE TABLE IF NOT EXISTS retirement_plans
                            (id INTEGER PRIMARY KEY AUTOINCREMENT,
                             user_id TEXT,
                             plan_data TEXT,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Retirement DB Init Error: {e}")

    def save_plan(self, user_id, plan_data):
        try:
            conn = sqlite3.connect(self.db_path)
            # Insert standard stringified JSON
            conn.execute('INSERT INTO retirement_plans (user_id, plan_data) VALUES (?, ?)',
                         (str(user_id), json.dumps(plan_data)))
            conn.commit()
            conn.close()
            return {"success": True, "message": "Plan saved successfully."}
        except Exception as e:
            return {"success": False, "message": f"DB Error: {str(e)}"}

    def get_saved_plans(self, user_id):
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            rows = conn.execute('SELECT * FROM retirement_plans WHERE user_id = ? ORDER BY created_at DESC', (str(user_id),)).fetchall()
            conn.close()
            
            plans = []
            for r in rows:
                plans.append({
                    "id": r['id'],
                    "created_at": r['created_at'],
                    "plan_data": json.loads(r['plan_data'])
                })
            return {"success": True, "plans": plans}
        except Exception as e:
            return {"success": False, "plans": [], "message": f"DB Error: {str(e)}"}

    def _format_money(self, amount):
        if amount >= 10000000: return f"₹{amount/10000000:.2f} Cr"
        elif amount >= 100000: return f"₹{amount/100000:.2f} Lakhs"
        return f"₹{amount:,.0f}"

    def analyze_retirement(self, data):
        ml_result = self.ml_service.predict_future(data)
        
        age = int(data.get('age', 30))
        ret_age = 60
        years = max(ret_age - age, 1)
        expense = float(data.get('monthly_expenses', 30000))
        savings = float(data.get('current_savings', 0)) + float(data.get('epf_balance', 0))
        sip = float(data.get('monthly_sip', 0)) + float(data.get('ppf_contribution', 0)) + float(data.get('nps_contribution', 0))
        
        inflation = float(data.get('inflation_assumption', 6.0)) / 100
        risk = data.get('risk_appetite', 'Moderate')
        ret = 0.12 if risk == 'Aggressive' else 0.10 if risk == 'Moderate' else 0.08

        fv_expense = expense * math.pow((1 + inflation), years)
        required_corpus = (fv_expense * 12) / 0.04 
        
        monthly_rate = ret / 12
        total_months = years * 12
        fv_savings = savings * math.pow((1 + ret), years)
        
        if monthly_rate > 0 and sip > 0:
            fv_sip = sip * (((math.pow((1 + monthly_rate), total_months) - 1) / monthly_rate) * (1 + monthly_rate))
        else:
            fv_sip = sip * total_months
            
        projected_corpus = fv_savings + fv_sip
        monthly_pension = (projected_corpus * 0.04) / 12

        deficit = required_corpus - projected_corpus
        extra_sip_needed = 0
        if deficit > 0:
            extra_sip_needed = deficit / (((math.pow((1 + monthly_rate), total_months) - 1) / monthly_rate) * (1 + monthly_rate))

        specific_suggestions = []
        emergency_fund = expense * 6
        specific_suggestions.append({
            "name": "Step 1: Build Your Safety Net (Do this first)",
            "logic": f"Before doing anything else, make sure you have {self._format_money(emergency_fund)} sitting in a completely safe Bank FD or Savings Account. This is exactly 6 months of your current expenses (₹{expense} x 6). Do not touch this money unless someone goes to the hospital or you lose your job."
        })

        if extra_sip_needed > 0:
            equity_sip = extra_sip_needed * 0.70
            debt_sip = extra_sip_needed * 0.30
            specific_suggestions.append({
                "name": "Step 2: Start a Stock Market SIP (For Fast Growth)",
                "logic": f"Because of price rises, saving in a bank is not enough. You must start a new monthly SIP of {self._format_money(equity_sip)} in a 'Nifty 50 Index Mutual Fund'. This automatically puts your money into India's top 50 biggest companies (like Tata, Reliance, and HDFC) which historically grow very fast over 10+ years."
            })
            specific_suggestions.append({
                "name": "Step 3: Build Safe Money (To protect against crashes)",
                "logic": f"The stock market goes up and down. To protect yourself, put {self._format_money(debt_sip)} every month into a PPF account or buy Sovereign Gold Bonds. This money is backed by the Government of India and will never drop in value."
            })
            specific_suggestions.append({
                "name": "Step 4: Increase Savings Every Year (The Secret Trick)",
                "logic": "Every time you get a salary hike at your job, increase your SIP amounts by 10%. If you do this simple trick, you will easily cross the red Danger Line on the graph much faster than you think."
            })
        else:
            specific_suggestions.append({
                "name": "Step 2: Maintain Your Current Momentum",
                "logic": "You are currently in a fantastic position. Do not stop your monthly SIPs. Consistency is your biggest weapon right now."
            })
            specific_suggestions.append({
                "name": "Step 3: Protect Your Wealth",
                "logic": "Since you are already on track to retire safely, your main goal is protection. Make sure you have a comprehensive Health Insurance plan (minimum ₹10 Lakhs coverage) so a sudden medical emergency doesn't wipe out your hard-earned savings."
            })

        coverage_percent = min(int((projected_corpus / max(required_corpus, 1)) * 100), 100)
        final_score = ml_result["score"]
        if coverage_percent >= 100: final_score = max(final_score, 95)
        
        status_text = "On Track (Safe)" if coverage_percent > 90 else "Needs Work" if coverage_percent > 60 else "Danger Zone"

        chart_data = []
        current = savings
        for a in range(age, ret_age + 1):
            chart_data.append({
                "age": a, 
                "projected_wealth": round(current, 2), 
                "target_corpus": round(required_corpus, 2)
            })
            for _ in range(12): current = current * (1 + monthly_rate) + sip

        return {
            "score": final_score,
            "risk_label": status_text,
            "total_wealth_at_60": self._format_money(projected_corpus),
            "monthly_income_after_60": f"{self._format_money(monthly_pension)} / month",
            "ai_main_suggestion": f"Based on 1,000 simulations, the AI calculates you are currently in the '{status_text}'. If you stop working at age {ret_age}, you will have {self._format_money(projected_corpus)}.",
            "detailed_explanation": {
                "inflation_impact": f"Right now, your family survives on {self._format_money(expense)} per month. But because of inflation (things getting more expensive every year), when you turn 60, that exact same lifestyle will cost you {self._format_money(fv_expense)} per month! Your savings must grow faster than this price rise.",
                "score_reason": f"If you keep saving the way you are right now, you will only have {coverage_percent}% of the money you actually need to survive in your old age without asking others for help."
            },
            "chart_data": chart_data,
            "specific_suggestions": specific_suggestions
        }