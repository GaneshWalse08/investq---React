"""
Advanced Government Scheme Intelligence Engine
Evaluates 18+ real Indian schemes based on deep user demographics.
"""

class SchemeService:
    def __init__(self):
        # Database of Real Indian Government Schemes (Rates as of FY 2024-25)
        self.SCHEMES = [
            {
                "id": "PPF", "name": "Public Provident Fund (PPF)", "category": "Safe Returns",
                "interest_rate": "7.1% p.a.", "lock_in": "15 Years", "tax_benefit": "EEE (Tax Free Maturity)",
                "min_investment": 500, "max_investment": 150000,
                "about": "A sovereign-backed, long-term savings scheme offered by the Government of India providing guaranteed, tax-free returns.",
                "benefits": "Completely immune to market volatility. The interest earned and the maturity amount are 100% tax-free under Section 80C.",
                "ai_suggestion": "Highly Recommended. PPF should be the foundational debt asset in almost every Indian investor's portfolio for pure capital protection.",
                "terms": "Partial withdrawals allowed only after 7 years. Can be extended in blocks of 5 years after maturity.",
                "target_profiles": ["Private", "Business", "Govt"], "min_age": 18, "max_age": 100
            },
            {
                "id": "NPS", "name": "National Pension System (NPS)", "category": "Pension",
                "interest_rate": "9% - 12% (Market Linked)", "lock_in": "Till Age 60", "tax_benefit": "EET (Extra 50k deduction)",
                "min_investment": 1000, "max_investment": 9999999,
                "about": "A voluntary, long-term retirement savings scheme managed by PFRDA combining equity and debt.",
                "benefits": "Offers an exclusive additional tax deduction of ₹50,000 under Section 80CCD(1B) over and above the 80C limit.",
                "ai_suggestion": "Crucial for Private sector employees lacking a standard pension. The extra ₹50k tax benefit makes it a mathematical no-brainer for high-income brackets.",
                "terms": "At age 60, 60% of the corpus is tax-free. The remaining 40% MUST be used to purchase an annuity (monthly pension).",
                "target_profiles": ["Private", "Business", "Govt"], "min_age": 18, "max_age": 70
            },
            {
                "id": "SSY", "name": "Sukanya Samriddhi Yojana (SSY)", "category": "Wealth Creation",
                "interest_rate": "8.2% p.a.", "lock_in": "21 Years from account opening", "tax_benefit": "EEE (Tax Free)",
                "min_investment": 250, "max_investment": 150000,
                "about": "A government-backed savings scheme targeted at the parents of girl children under the 'Beti Bachao, Beti Padhao' campaign.",
                "benefits": "Currently offers the highest interest rate among all fixed-income government schemes. 100% tax-free maturity.",
                "ai_suggestion": "If you have a daughter under 10, maxing out SSY up to ₹1.5L annually is the mathematically superior choice over PPF or FDs.",
                "terms": "Only for girl children under 10 years of age. Maximum 2 accounts per family. Withdrawals allowed for higher education at age 18.",
                "target_profiles": ["Has_Girl_Child"], "min_age": 18, "max_age": 100
            },
            {
                "id": "SCSS", "name": "Senior Citizen Savings Scheme (SCSS)", "category": "Pension",
                "interest_rate": "8.2% p.a.", "lock_in": "5 Years", "tax_benefit": "Section 80C",
                "min_investment": 1000, "max_investment": 3000000,
                "about": "A government-backed retirement benefits program offering a regular income stream for senior citizens.",
                "benefits": "Provides guaranteed, quarterly interest payouts, acting as a reliable pension replacement.",
                "ai_suggestion": "The ultimate safe-haven asset for retirees. Lock in your retirement corpus here to ensure quarterly cash flow without market risk.",
                "terms": "Must be 60+ years old (or 55+ for early retirees). Interest is fully taxable as per your income slab.",
                "target_profiles": ["Govt", "Private", "Business", "Unemployed"], "min_age": 60, "max_age": 100
            },
            {
                "id": "EPF", "name": "Employees' Provident Fund (EPF)", "category": "Pension",
                "interest_rate": "8.25% p.a.", "lock_in": "Till Retirement/Resignation", "tax_benefit": "EEE",
                "min_investment": 1800, "max_investment": 9999999,
                "about": "A mandatory retirement savings scheme for salaried employees in organizations with 20+ workers.",
                "benefits": "Employer matches your 12% contribution. Earns high, tax-free compounding interest.",
                "ai_suggestion": "For salaried individuals, Voluntary Provident Fund (VPF) is a great way to legally earn 8.25% tax-free by contributing more than the mandatory 12%.",
                "terms": "Interest on contributions above ₹2.5 Lakhs per year is now taxable.",
                "target_profiles": ["Private", "Govt"], "min_age": 18, "max_age": 58
            },
            {
                "id": "MSSC", "name": "Mahila Samman Savings Certificate", "category": "Safe Returns",
                "interest_rate": "7.5% p.a.", "lock_in": "2 Years", "tax_benefit": "None (Taxable)",
                "min_investment": 1000, "max_investment": 200000,
                "about": "A one-time small savings scheme backed by the government specifically for women and girls.",
                "benefits": "Short 2-year lock-in with a highly attractive 7.5% fixed interest rate.",
                "ai_suggestion": "Excellent short-term parking vehicle for women's emergency funds or short-term goals compared to standard bank FDs.",
                "terms": "Available only for women. Maximum deposit is ₹2 Lakhs. Partial withdrawal of 40% allowed after 1 year.",
                "target_profiles": ["Female"], "min_age": 0, "max_age": 100
            },
            {
                "id": "SGB", "name": "Sovereign Gold Bonds (SGB)", "category": "Wealth Creation",
                "interest_rate": "2.5% + Gold Appreciation", "lock_in": "8 Years (Exit at 5th)", "tax_benefit": "No Capital Gains Tax",
                "min_investment": 1, "max_investment": 4000,
                "about": "Government securities denominated in grams of gold. They are substitutes for holding physical gold.",
                "benefits": "You earn 2.5% annual interest on the gold value, AND capital gains are 100% tax-free if held to maturity.",
                "ai_suggestion": "The absolute best way to invest in Gold. It eliminates making charges, storage risks, and provides a bonus 2.5% dividend.",
                "terms": "Tradable on the stock exchange. Minimum investment is 1 gram of gold.",
                "target_profiles": ["Private", "Business", "Govt"], "min_age": 18, "max_age": 100
            },
            {
                "id": "APY", "name": "Atal Pension Yojana", "category": "Pension",
                "interest_rate": "Guaranteed Pension", "lock_in": "Till Age 60", "tax_benefit": "Section 80CCD",
                "min_investment": 42, "max_investment": 1454,
                "about": "A pension scheme primarily focused on the unorganized sector, guaranteeing a minimum monthly pension of ₹1,000 to ₹5,000.",
                "benefits": "Extremely low monthly contribution for guaranteed lifetime income post-60.",
                "ai_suggestion": "Highly recommended for low-income brackets, domestic help, or small business owners wanting guaranteed basic survival income.",
                "terms": "Must join between age 18 and 40. The pension starts strictly at age 60.",
                "target_profiles": ["Business", "Unemployed", "Private"], "min_age": 18, "max_age": 40
            },
            {
                "id": "KVP", "name": "Kisan Vikas Patra (KVP)", "category": "Safe Returns",
                "interest_rate": "7.5% p.a.", "lock_in": "115 Months (9.5 Years)", "tax_benefit": "None (Taxable)",
                "min_investment": 1000, "max_investment": 9999999,
                "about": "A certificate scheme from Indian Post Offices that guarantees to exactly double your one-time investment in a specific period.",
                "benefits": "Zero risk of capital loss. Simple mechanism: invest X, get 2X in 115 months.",
                "ai_suggestion": "Good for rural investors without demat accounts, but mathematically inferior to PPF due to the lack of tax benefits.",
                "terms": "Interest is fully taxable. Premature withdrawal allowed only after 2.5 years.",
                "target_profiles": ["Business", "Private", "Govt"], "min_age": 18, "max_age": 100
            },
            {
                "id": "ELSS", "name": "ELSS Mutual Funds", "category": "Wealth Creation",
                "interest_rate": "12-15% (Historical Avg)", "lock_in": "3 Years", "tax_benefit": "Section 80C",
                "min_investment": 500, "max_investment": 9999999,
                "about": "Equity Linked Savings Schemes are mutual funds that invest primarily in the stock market but qualify for government tax deductions.",
                "benefits": "The shortest lock-in period (3 years) among all tax-saving instruments, with the highest potential returns.",
                "ai_suggestion": "The ultimate wealth creation tool for the young. Use this to max out your 80C limit if you have a high risk appetite.",
                "terms": "Market-linked risk. Long Term Capital Gains (LTCG) tax of 12.5% applies on gains over ₹1.25 Lakhs.",
                "target_profiles": ["Private", "Business", "Govt"], "min_age": 18, "max_age": 60
            },
            {
                "id": "NSC", "name": "National Savings Certificate (NSC)", "category": "Tax Saving",
                "interest_rate": "7.7% p.a.", "lock_in": "5 Years", "tax_benefit": "Section 80C",
                "min_investment": 1000, "max_investment": 9999999,
                "about": "A fixed-income investment scheme available at Post Offices, designed for small-to-mid income investors to save tax.",
                "benefits": "Higher interest rate than a 5-year bank Tax-Saver FD. The interest accrued yearly is reinvested and qualifies for 80C.",
                "ai_suggestion": "A solid alternative to 5-year FDs. Use NSC if your risk tolerance is strictly zero but you need to save tax.",
                "terms": "Interest is taxable upon maturity. No premature withdrawal allowed except in case of death.",
                "target_profiles": ["Private", "Business", "Govt"], "min_age": 18, "max_age": 100
            },
            {
                "id": "PMJJBY", "name": "PM Jeevan Jyoti Bima Yojana", "category": "Insurance",
                "interest_rate": "N/A", "lock_in": "1 Year (Renewable)", "tax_benefit": "None",
                "min_investment": 436, "max_investment": 436,
                "about": "A pure-term life insurance policy backed by the government.",
                "benefits": "Provides ₹2 Lakhs life cover for any cause of death at a highly subsidized premium of just ₹436/year.",
                "ai_suggestion": "A must-have baseline life insurance for low-income earners or support staff. Costs less than a cup of coffee per month.",
                "terms": "Auto-debited annually. Cover ends at age 55.",
                "target_profiles": ["Private", "Business", "Unemployed"], "min_age": 18, "max_age": 50
            },
            {
                "id": "PMSBY", "name": "PM Suraksha Bima Yojana", "category": "Insurance",
                "interest_rate": "N/A", "lock_in": "1 Year (Renewable)", "tax_benefit": "None",
                "min_investment": 20, "max_investment": 20,
                "about": "An accidental death and disability insurance scheme.",
                "benefits": "Provides ₹2 Lakhs for accidental death/full disability for just ₹20 per year.",
                "ai_suggestion": "At ₹20 a year, there is absolutely no reason not to link this to your bank account immediately.",
                "terms": "Auto-debited annually from savings account. Ends at age 70.",
                "target_profiles": ["Private", "Business", "Govt", "Unemployed"], "min_age": 18, "max_age": 70
            },
            {
                "id": "POMIS", "name": "Post Office Monthly Income Scheme", "category": "Pension",
                "interest_rate": "7.4% p.a.", "lock_in": "5 Years", "tax_benefit": "None (Taxable)",
                "min_investment": 1000, "max_investment": 900000,
                "about": "An investment scheme offering guaranteed monthly income, popular among retirees and conservative investors.",
                "benefits": "Generates a fixed, reliable monthly paycheck backed by sovereign guarantee.",
                "ai_suggestion": "Excellent for supplementing monthly household income without depleting your primary capital.",
                "terms": "Maximum limit is ₹9 Lakhs for single accounts, ₹15 Lakhs for joint. Premature closure incurs a 1-2% penalty.",
                "target_profiles": ["Govt", "Private", "Business"], "min_age": 18, "max_age": 100
            },
            {
                "id": "PORD", "name": "Post Office Recurring Deposit", "category": "Safe Returns",
                "interest_rate": "6.7% p.a.", "lock_in": "5 Years", "tax_benefit": "None (Taxable)",
                "min_investment": 100, "max_investment": 9999999,
                "about": "A systematic savings plan allowing you to deposit a fixed amount every month for 5 years.",
                "benefits": "Forces financial discipline with very low minimum entry barriers.",
                "ai_suggestion": "Useful for automating savings if you struggle with cash management, though Mutual Fund SIPs offer much better long-term yields.",
                "terms": "Defaulting on monthly payments incurs penalties. Can be extended beyond 5 years.",
                "target_profiles": ["Private", "Business", "Unemployed"], "min_age": 18, "max_age": 100
            }
        ]

    def fetch_personalized_schemes(self, user_data):
        age = int(user_data.get('age', 30))
        income = float(user_data.get('income', 800000))
        job_type = user_data.get('job_type', 'Private')
        gender = user_data.get('gender', 'Male')
        
        # New Dynamic Children Logic
        num_children = int(user_data.get('num_children', 0))
        num_daughters = int(user_data.get('num_daughters', 0))
        
        # Safely handle empty strings if user deletes the number
        youngest_age_str = user_data.get('youngest_daughter_age', '99')
        youngest_daughter_age = int(youngest_age_str) if youngest_age_str != '' else 99

        goal = user_data.get('goal', 'Wealth Creation')
        monthly_budget = float(user_data.get('budget', 10000))

        recommended = []

        for scheme in self.SCHEMES:
            score = 0
            
            # 1. Eligibility Checks (Hard filters)
            if age < scheme['min_age'] or age > scheme['max_age']:
                continue
                
            # SSY Check: Must have at least 1 daughter aged 10 or under
            if "Has_Girl_Child" in scheme['target_profiles']:
                if num_daughters == 0 or youngest_daughter_age > 10:
                    continue
                    
            if "Female" in scheme['target_profiles'] and gender == 'Male':
                continue

            # 2. Scoring System based on User Form
            if job_type in scheme['target_profiles']:
                score += 10
            
            if scheme['category'] == goal:
                score += 20
                
            # Job specific boosts
            if job_type == 'Private' and scheme['id'] in ['NPS', 'PPF', 'ELSS']:
                score += 15 
            if job_type == 'Govt' and scheme['id'] in ['SCSS', 'POMIS']:
                score += 10
                
            # Goal specific boosts
            if goal == 'Tax Saving' and ('80C' in scheme['tax_benefit'] or 'EEE' in scheme['tax_benefit']):
                score += 25
            if goal == 'Pension' and scheme['id'] in ['NPS', 'APY', 'SCSS', 'EPF']:
                score += 25

            # Child/Gender boosts
            if num_daughters > 0 and youngest_daughter_age <= 10 and scheme['id'] == 'SSY':
                score += 50 # Massive boost if eligible for SSY
            if gender == 'Female' and scheme['id'] == 'MSSC':
                score += 20

            if score > 0:
                recommended.append({
                    "scheme": scheme,
                    "relevance_score": score
                })

        # Sort by relevance
        recommended = sorted(recommended, key=lambda x: x['relevance_score'], reverse=True)
        top_schemes = [item['scheme'] for item in recommended[:15]]

        return {
            "success": True,
            "profile_analysis": f"Based on your profile as a {age}-year-old {job_type} worker looking for {goal}, we have filtered the most optimal Sovereign-backed schemes.",
            "schemes": top_schemes
        }