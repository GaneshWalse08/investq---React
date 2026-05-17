# backend/services/retirement_service.py
import math

class RetirementService:
    def __init__(self):
        self.default_inflation = 0.06
        self.safe_withdrawal_rate = 0.04 # The famous 4% rule
        self.life_expectancy = 85

    # Helper to make money look friendly
    def _format_money(self, amount):
        if amount >= 10000000:
            return f"₹{amount/10000000:.2f} Crores"
        elif amount >= 100000:
            return f"₹{amount/100000:.2f} Lakhs"
        else:
            return f"₹{amount:,.0f}"

    def analyze_retirement(self, data):
        current_age = int(data.get('current_age', 30))
        retirement_age = int(data.get('retirement_age', 60))
        current_expense = float(data.get('current_expense', 50000))
        current_savings = float(data.get('current_savings', 500000))
        monthly_investment = float(data.get('monthly_investment', 10000))
        inflation_rate = float(data.get('inflation_rate', self.default_inflation))
        portfolio_return = float(data.get('portfolio_return', 0.12)) 

        years_to_retire = retirement_age - current_age
        if years_to_retire <= 0:
            return {"error": "Your retirement age must be higher than your current age."}

        # 1. The Math
        future_monthly_expense = current_expense * math.pow((1 + inflation_rate), years_to_retire)
        future_annual_expense = future_monthly_expense * 12
        required_corpus = future_annual_expense / self.safe_withdrawal_rate

        fv_savings = current_savings * math.pow((1 + portfolio_return), years_to_retire)
        monthly_rate = portfolio_return / 12
        total_months = years_to_retire * 12
        fv_investments = monthly_investment * ((math.pow((1 + monthly_rate), total_months) - 1) / monthly_rate) * (1 + monthly_rate)

        projected_corpus = fv_savings + fv_investments
        deficit = max(required_corpus - projected_corpus, 0)
        
        # 2. THE MAGIC METRIC: Monthly Pension
        monthly_pension = (projected_corpus * self.safe_withdrawal_rate) / 12

        score = min(max(int((projected_corpus / required_corpus) * 100), 0), 100)

        # 3. The Friendly AI Action Plan
        plan = []
        
        # --- Pension Breakdown ---
        plan.append({
            "title": "💸 Your Monthly Pension (Salary without working)",
            "desc": f"When you stop working at age {retirement_age}, your saved money will act like a salary machine. It will safely pay you {self._format_money(monthly_pension)} every single month for the rest of your life!"
        })

        # --- How to Optimize ---
        if deficit > 0:
            additional_sip = deficit / (((math.pow((1 + monthly_rate), total_months) - 1) / monthly_rate) * (1 + monthly_rate))
            plan.append({
                "title": "⚠️ How to fix your savings",
                "desc": f"To afford your dream retirement, you are falling a bit short. Try to increase your monthly investment by {self._format_money(additional_sip)}. Cutting back on small daily expenses can help you easily reach this!"
            })
        else:
            plan.append({
                "title": "✅ You are doing great!",
                "desc": "Your current savings plan is perfect. If you keep investing this exact amount every month, you will be totally financially free!"
            })

        # --- Where to Invest ---
        if years_to_retire >= 10:
            plan.append({
                "title": "📈 Where exactly should you invest?",
                "desc": "Because you have more than 10 years left, DO NOT keep money in a normal bank account (inflation will eat it). The AI suggests: Put 70% in Nifty 50 Index Mutual Funds (for high growth) and 30% in safe Government schemes like EPF or PPF."
            })
        elif years_to_retire >= 4:
            plan.append({
                "title": "⚖️ Where exactly should you invest?",
                "desc": "You are getting closer to retirement. Balance your money: Put 50% in Mutual Funds (for growth) and 50% in very safe Fixed Deposits (FDs) or PPF to protect what you have earned."
            })
        else:
            plan.append({
                "title": "🛡️ Where exactly should you invest?",
                "desc": "You are retiring very soon! Protect your money at all costs. Move 80% of your wealth into highly secure Senior Citizen Savings Schemes, Post Office Monthly Income Schemes, or FDs."
            })

        return {
            "metrics": {
                "monthly_pension": monthly_pension,
                "required_corpus": required_corpus,
                "projected_corpus": projected_corpus,
                "future_monthly_expense": future_monthly_expense,
                "readiness_score": score
            },
            "explainable_ai": {
                "simple_plan": plan
            },
            "chart_data": self._generate_chart_data(current_age, retirement_age, current_savings, monthly_investment, portfolio_return, required_corpus)
        }

    def _generate_chart_data(self, start_age, ret_age, savings, monthly_investment, ret_rate, target):
        data = []
        current_wealth = savings
        monthly_rate = ret_rate / 12
        for age in range(start_age, ret_age + 1):
            data.append({
                "age": age,
                "projected_wealth": round(current_wealth, 2),
                "target_corpus": round(target, 2)
            })
            for _ in range(12):
                current_wealth = current_wealth * (1 + monthly_rate) + monthly_investment
        return data