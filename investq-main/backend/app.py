"""
AI-Powered ESG-Aware Sustainable Investment Decision Support System
Main Flask Application Entry Point
"""
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS  # <-- The new bulletproof CORS library
import os, sys

sys.path.insert(0, os.path.dirname(__file__))

from services.ml_service import MLService
from services.auth_service import AuthService
from services.data_service import DataService
from services.metrics_service import MetricsService
from services.ranking_service import RankingService
from services.esg_service import ESGService
from services.personalization_service import PersonalizationService
from services.portfolio_service import PortfolioService
from services.optimization_service import OptimizationService
from services.clustering_service import ClusteringService
from services.news_service import NewsService
from services.chatbot_service import ChatbotService
from services.scheme_service import SchemeService
from services.scheme_service import SchemeService
from services.insurance_service import InsuranceService
from services.retirement_service import RetirementService
from services.ml_recommendation_service import MLRecommendationService


app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.secret_key = 'esg_invest_secret_2024'

# ── Enable CORS globally so React (Port 5173) can talk to Flask (Port 5000) ──
CORS(app)

# ── Initialize Services ──────────────────────────────────────────────────────
auth_svc          = AuthService()
data_svc          = DataService()
metrics_svc       = MetricsService(data_svc)
esg_svc           = ESGService()
ranking_svc       = RankingService(metrics_svc, esg_svc)
personal_svc      = PersonalizationService(ranking_svc, data_svc)
portfolio_svc     = PortfolioService(data_svc, esg_svc, metrics_svc)
optimization_svc  = OptimizationService(data_svc)
clustering_svc    = ClusteringService()
news_svc          = NewsService()
chatbot_svc       = ChatbotService()
ml_svc            = MLService(data_svc)
ml_rec_svc = MLRecommendationService()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    if path and os.path.exists(os.path.join(frontend_dir, path)):
        return send_from_directory(frontend_dir, path)
    return send_from_directory(frontend_dir, 'index.html')

# ════════════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    result = auth_svc.register(
        data.get('username'), data.get('email'),
        data.get('password'), data.get('preferences', {})
    )
    return jsonify(result)

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    result = auth_svc.login(data.get('username'), data.get('password'))
    if result['success']:
        session['user_id'] = result['user']['id']
    return jsonify(result)

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out'})

@app.route('/api/auth/profile', methods=['GET'])
def get_profile():
    user_id = request.args.get('user_id')
    return jsonify(auth_svc.get_profile(user_id))

@app.route('/api/auth/profile', methods=['PUT'])
def update_profile():
    data = request.json
    return jsonify(auth_svc.update_profile(data.get('user_id'), data.get('preferences', {})))

# ════════════════════════════════════════════════════════════════════════════
# MARKET DATA ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/stocks', methods=['GET'])
def get_all_stocks():
    return jsonify(data_svc.get_all_stocks())

@app.route('/api/stocks/<ticker>', methods=['GET'])
def get_stock_detail(ticker):
    stock   = data_svc.get_stock(ticker)
    metrics = metrics_svc.get_metrics(ticker)
    esg     = esg_svc.get_esg(ticker)
    return jsonify({'stock': stock, 'metrics': metrics, 'esg': esg})

@app.route('/api/stocks/<ticker>/history', methods=['GET'])
def get_stock_history(ticker):
    return jsonify(data_svc.get_price_history(ticker))

# ════════════════════════════════════════════════════════════════════════════
# ESG ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/esg/rankings', methods=['GET'])
def esg_rankings():
    sector = request.args.get('sector', 'all')
    return jsonify(esg_svc.get_rankings(sector))

@app.route('/api/esg/correlation', methods=['GET'])
def esg_correlation():
    return jsonify(esg_svc.get_esg_financial_correlation(metrics_svc))

@app.route('/api/esg/sectors', methods=['GET'])
def esg_sectors():
    return jsonify(esg_svc.get_sector_summary())

# ════════════════════════════════════════════════════════════════════════════
# RANKING ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/rankings', methods=['GET'])
def get_rankings():
    esg_weight = float(request.args.get('esg_weight', 0.4))
    sector     = request.args.get('sector', 'all')
    return jsonify(ranking_svc.compute_rankings(esg_weight=esg_weight, sector=sector))

@app.route('/api/rankings/personalized', methods=['POST'])
def personalized_rankings():
    prefs = request.json
    return jsonify(personal_svc.get_personalized(prefs))

# ════════════════════════════════════════════════════════════════════════════
# PORTFOLIO ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/portfolio/optimize_saved', methods=['POST', 'OPTIONS'])
def optimize_saved_portfolio():

    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    data = request.json
    holdings = data.get('holdings', [])
    goal = data.get('goal', 'sharpe')
    
    if len(holdings) < 2:
        return jsonify({'success': False, 'message': 'You need at least 2 assets in a portfolio to optimize it.'})
        
    current_analysis = portfolio_svc.analyze_portfolio(holdings)
    tickers = [item['ticker'] for item in current_analysis.get('assets', [])]
    
    if len(tickers) < 2:
        return jsonify({'success': False, 'message': 'Not enough valid assets with historical data to run optimization.'})
    
    try:
        optimal_result = optimization_svc.optimize(tickers, goal)
        if 'error' in optimal_result:
            return jsonify({'success': False, 'message': f"Math Engine: {optimal_result['error']}"})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Optimization crashed: {str(e)}'})
        
    comparison = []
    
    allocations = optimal_result.get('allocation', [])
    opt_map = {a['ticker']: a['weight'] for a in allocations}
    all_metrics = metrics_svc.get_all_metrics()
    
    for asset in current_analysis['assets']:
        ticker = asset['ticker']
        curr_weight = asset['weight']
        opt_weight = opt_map.get(ticker, 0.0)
        diff = opt_weight - curr_weight
        
        action = "HOLD"
        reasoning = f"{ticker} is perfectly weighted for your current risk profile. Maintain this position to stabilize your portfolio."
        
        if diff > 3.0: 
            action = "BUY"
            reasoning = f"The AI identifies {ticker} as mathematically essential to improve your risk-to-reward ratio. Increasing exposure by {diff:.1f}% captures its upward momentum while balancing overall sector risk."
        elif diff < -3.0: 
            if opt_weight <= 0.5:
                action = "REMOVE"
                reasoning = f"Liquidating {ticker} eliminates dead weight. Its historical volatility-to-return profile is actively dragging down your portfolio's efficiency frontier."
            else:
                action = "SELL"
                reasoning = f"Trimming your position in {ticker} by {abs(diff):.1f}% reduces dangerous over-concentration. The AI prevents any single asset from exceeding risk thresholds, freeing up capital for more efficient assets."
            
        comparison.append({
            'ticker': ticker,
            'current_weight': curr_weight,
            'optimal_weight': opt_weight,
            'action': action,
            'sector': asset['sector'],
            'reasoning': reasoning # <-- NEW DEEP REASONING ADDED
        })

    # AI SMART SWAP LOGIC
    all_stocks = data_svc.get_all_stocks()
    suggested_swaps = []
    
    for c in comparison:
        if c['action'] in ['SELL', 'REMOVE']:
            ticker_to_remove = c['ticker']
            sector = c['sector']
            
            candidates = [s for s in all_stocks if s['sector'] == sector and s['ticker'] not in tickers]
            if candidates:
                candidates = sorted(candidates, key=lambda x: all_metrics.get(x['ticker'], {}).get('sharpe', 0), reverse=True)
                best_alt = candidates[0]
                alt_ticker = best_alt['ticker']
                
                remove_sharpe = all_metrics.get(ticker_to_remove, {}).get('sharpe', 0)
                add_sharpe = all_metrics.get(alt_ticker, {}).get('sharpe', 0)
                
                if add_sharpe > remove_sharpe:
                    suggested_swaps.append({
                        'remove_ticker': ticker_to_remove,
                        'add_ticker': alt_ticker,
                        'sector': sector,
                        'reason': f"Deep Sector Analysis: Instead of just selling {ticker_to_remove}, consider swapping it for {alt_ticker}. Both are in the {sector} sector, but {alt_ticker} has a superior Sharpe ratio ({add_sharpe:.2f} vs {remove_sharpe:.2f}), meaning it gives you more return for less risk.",
                        'remove_ret': all_metrics.get(ticker_to_remove, {}).get('return_1y', 0),
                        'add_ret': all_metrics.get(alt_ticker, {}).get('return_1y', 0)
                    })

    goal_text = "Maximize Sharpe Ratio (Balanced)" if goal == "sharpe" else "Minimize Volatility (Safest)" if goal == "min_vol" else "Maximize Return (Aggressive)"
    verdict_html = f"To reach your goal to <strong>{goal_text}</strong>, the AI has calculated the mathematical ideal weights for your current assets."
    
    return jsonify({
        'success': True,
        'current_return': current_analysis['expected_return'],
        'optimal_result': optimal_result,
        'comparison': comparison,
        'suggested_swaps': suggested_swaps,
        'verdict': verdict_html
    })

@app.route('/api/portfolio/efficient_frontier', methods=['POST'])
def efficient_frontier():
    data = request.json
    tickers = data.get('tickers', [])
    try:
        result = optimization_svc.efficient_frontier(tickers)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'frontier': [], 'individual_stocks': []})

# ════════════════════════════════════════════════════════════════════════════
# NEWS ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/news', methods=['GET'])
def get_news():
    ticker = request.args.get('ticker', None)
    return jsonify(news_svc.get_news(ticker))

@app.route('/api/news/sentiment', methods=['GET'])
def market_sentiment():
    return jsonify(news_svc.market_sentiment_summary())

# ════════════════════════════════════════════════════════════════════════════
# CLUSTERING ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/clustering/investors', methods=['GET'])
def cluster_investors():
    return jsonify(clustering_svc.cluster_investors(auth_svc.get_all_users()))

@app.route('/api/clustering/stocks', methods=['GET'])
def cluster_stocks():
    return jsonify(clustering_svc.cluster_stocks(metrics_svc, esg_svc))

# ════════════════════════════════════════════════════════════════════════════
# RESEARCH / ANALYTICS
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/research/correlation_matrix', methods=['GET'])
def correlation_matrix():
    return jsonify(metrics_svc.correlation_matrix())

@app.route('/api/ml/predict/<ticker>', methods=['GET'])
def predict_stock(ticker):
    days = int(request.args.get('days', 30))
    return jsonify(ml_svc.predict_price(ticker, days))

@app.route('/api/research/sector_heatmap', methods=['GET'])
def sector_heatmap():
    return jsonify(esg_svc.sector_heatmap(metrics_svc))

@app.route('/api/dashboard/summary', methods=['GET'])
def dashboard_summary():
    all_stocks = data_svc.get_all_stocks()
    movers_sorted = sorted(all_stocks, key=lambda x: x.get('change_pct', 0), reverse=True)
    
    top_gainers = movers_sorted[:10]
    top_losers = movers_sorted[-10:]
    top_losers.reverse()

    return jsonify({
        'market_overview'   : data_svc.market_overview(),
        'top_esg'           : esg_svc.get_rankings('all')[:5],
        'top_ranked'        : ranking_svc.compute_rankings()[:5],
        'sentiment'         : news_svc.market_sentiment_summary(),
        'recent_news'       : news_svc.get_news()[:6],
        'top_gainers'       : top_gainers,      
        'top_losers'        : top_losers        
    })

# ════════════════════════════════════════════════════════════════════════════
# DAILY AUTO UPDATE SCHEDULER
# ════════════════════════════════════════════════════════════════════════════
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

def run_daily_updates():
    print("\n🔄 [AUTO-UPDATE] Running background data refresh...")
    try:
        data_svc._build_histories()
        metrics_svc._compute_all()
        news_svc._fetch_live_news()
        print("✅ [AUTO-UPDATE] Market data and news refreshed successfully!\n")
    except Exception as e:
        print(f"❌ [AUTO-UPDATE] Error during refresh: {e}\n")

if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=run_daily_updates, trigger="interval", hours=24)
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())

@app.route('/api/admin/force_update', methods=['POST'])
def force_update():
    run_daily_updates()
    return jsonify({'success': True, 'message': 'System data refreshed successfully!'})

# ════════════════════════════════════════════════════════════════════════════
# GOAL-BASED INVESTING ENDPOINT
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/goals/plan', methods=['POST'])
def plan_goal():
    try:
        data = request.json
        goal_type = data.get('goal_type', 'Custom Goal')
        target = float(data.get('target_amount') or 500000)
        years = float(data.get('years') or 3)
        initial = float(data.get('initial_investment') or 0)

        if years <= 0:
            return jsonify({'success': False, 'message': 'Years must be greater than 0.'})

        if years < 3:
            strategy, risk_tolerance = "Conservative (Capital Preservation)", "low"
        elif years <= 7:
            strategy, risk_tolerance = "Balanced Growth", "moderate"
        else:
            strategy, risk_tolerance = "Aggressive Growth (Wealth Accumulation)", "high"

        ranked = ranking_svc.compute_rankings()
        valid = []
        for s in ranked:
            ret = s.get('return_1y')
            if ret is not None and float(ret) > 0:
                valid.append(s)

        if risk_tolerance == "low":
            valid = sorted(valid, key=lambda x: (float(x.get('volatility') or 0), -float(x.get('esg_total') or 0)))
        elif risk_tolerance == "moderate":
            valid = sorted(valid, key=lambda x: -float(x.get('sharpe') or 0))
        else:
            valid = sorted(valid, key=lambda x: -float(x.get('return_1y') or 0))

        selected_stocks = valid[:6]
        
        if not selected_stocks:
            return jsonify({'success': False, 'message': 'Not enough stock data available. Please click "Refresh Market Data" in the sidebar.'})

        if len(selected_stocks) >= 6:
            weights = [30, 25, 15, 10, 10, 10]
        else:
            weights = [100 // len(selected_stocks)] * len(selected_stocks)
            weights[0] += 100 - sum(weights) 
            
        portfolio = []
        raw_expected_return = 0
        
        for i, stock in enumerate(selected_stocks):
            weight = weights[i]
            stock_ret = float(stock.get('return_1y') or 0)
            raw_expected_return += (stock_ret * (weight / 100))
            
            portfolio.append({
                'ticker': stock['ticker'],
                'sector': stock.get('sector', 'Unknown'),
                'weight': weight,
                'return_1y': round(stock_ret, 2),
                'esg_rating': stock.get('esg_rating', 'N/A'),
                'investment_amount': round(initial * (weight / 100), 2)
            })

        if years >= 10:
            expected_port_return = min(raw_expected_return, 15.0)
        elif years >= 5:
            expected_port_return = min(raw_expected_return, 18.0)
        else:
            expected_port_return = raw_expected_return

        verdict = f"To reach your <strong>{goal_type}</strong> goal of ₹{target:,.0f} in {years} years, the AI has built a <strong>{strategy}</strong> portfolio. "
        verdict += f"This selection of {len(selected_stocks)} ESG-compliant stocks focuses on your timeframe and risk profile, targeting an expected annual return of <strong style='color:var(--moss);'>{expected_port_return:.1f}%</strong> based on historical data."

        return jsonify({
            'success': True,
            'expected_return': round(expected_port_return, 2),
            'strategy': strategy,
            'portfolio': portfolio,
            'verdict': verdict,
            'initial_invested': initial
        })
        
    except Exception as e:
        import traceback
        print("GOAL PLAN ERROR:", traceback.format_exc())
        return jsonify({'success': False, 'message': f'Server Math Error: {str(e)}'})

# ════════════════════════════════════════════════════════════════════════════
# FIXED DEPOSIT (FD) ANALYZER
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/investments/fd_analyze', methods=['POST'])
def analyze_fd():
    data = request.json
    principal = float(data.get('principal') or 100000)
    rate = float(data.get('rate') or 7.0)
    years = float(data.get('years') or 5)
    inflation = float(data.get('inflation') or 6.0)
    
    maturity = principal * ((1 + (rate/100)/4) ** (4 * years))
    interest_earned = maturity - principal
    real_rate = rate - inflation
    
    verdict = "A Fixed Deposit (FD) guarantees your principal and interest, making it the ultimate zero-risk asset. "
    if real_rate <= 0:
        verdict += f"<br><br>However, with inflation at {inflation}%, your <strong>Real Rate of Return is {real_rate:.1f}%</strong>. This means your money is mathematically losing purchasing power over time. <br><br><strong style='color:var(--rust);'>AI Verdict:</strong> Use this FD <em>only</em> for an emergency fund or capital you need within 1-3 years. Do not use this as a long-term wealth creation tool."
    else:
        verdict += f"<br><br>With inflation at {inflation}%, your <strong>Real Rate of Return is positive (+{real_rate:.1f}%)</strong>. <br><br><strong style='color:var(--moss);'>AI Verdict:</strong> This is a highly lucrative lock-in rate. It is strongly recommended to secure this FD immediately for the conservative bucket of your asset allocation."
        
    return jsonify({
        'success': True,
        'maturity': round(maturity),
        'interest': round(interest_earned),
        'real_rate': round(real_rate, 2),
        'verdict': verdict
    })

# ════════════════════════════════════════════════════════════════════════════
# GLOBAL MACRO EVENT ANALYZER (UPGRADED)
# ════════════════════════════════════════════════════════════════════════════
MACRO_LOGIC = {
    "interest_rate_hike": {
        "name": "🏦 Interest Rate Hike",
        "desc": "Central banks raise rates to fight inflation. Borrowing becomes expensive, cooling down growth-heavy sectors (like Tech), but directly benefiting lenders who can charge higher interest.",
        "positive_sectors": ["Finance"], "negative_sectors": ["Technology", "Real Estate"], "color": "#3b82f6"
    },
    "oil_surge": {
        "name": "🛢️ Oil Price Surge",
        "desc": "Geopolitical tensions or OPEC supply cuts drive up crude oil prices. This increases transport costs and inflation, but heavily benefits traditional energy.",
        "positive_sectors": ["Energy", "Clean Energy"], "negative_sectors": ["Consumer Staples", "Industrial"], "color": "#f59e0b"
    },
    "green_subsidy": {
        "name": "🌱 Massive Green Subsidies",
        "desc": "Governments announce multi-billion dollar funding for renewable infrastructure, carbon-neutral initiatives, and EV grid expansion.",
        "positive_sectors": ["Clean Energy", "Utilities"], "negative_sectors": ["Energy"], "color": "#22c55e"
    },
    "global_conflict": {
        "name": "⚔️ Global Conflict",
        "desc": "Uncertainty and supply chain disruptions drive investors to safe-haven, defensive assets. Highly cyclical and consumer-dependent sectors suffer.",
        "positive_sectors": ["Healthcare", "Utilities", "Energy"], "negative_sectors": ["Consumer Staples", "Technology"], "color": "#ef4444"
    },
    "inflation_spike": {
        "name": "📈 Inflation Spike",
        "desc": "The cost of goods rises rapidly. Companies that sell daily essentials (food, toothpaste) can pass costs to consumers, while luxury goods and high-growth tech suffer.",
        "positive_sectors": ["Consumer Staples", "Healthcare"], "negative_sectors": ["Technology", "Finance"], "color": "#d946ef"
    },
    "ai_boom": {
        "name": "🤖 AI & Tech Boom",
        "desc": "A major breakthrough in Artificial Intelligence or semiconductor manufacturing triggers massive capital inflow into the technology sector.",
        "positive_sectors": ["Technology"], "negative_sectors": ["Utilities", "Consumer Staples"], "color": "#8b5cf6"
    },
    "regulation": {
        "name": "⚖️ Regulatory Crackdown",
        "desc": "Governments announce strict antitrust laws or massive fines on monopolistic sectors (usually Big Tech or Big Pharma), causing investors to flee to safer, unregulated industries.",
        "positive_sectors": ["Utilities", "Consumer Staples"], "negative_sectors": ["Technology", "Healthcare"], "color": "#64748b"
    },
    "supply_chain": {
        "name": "🚢 Supply Chain Crisis",
        "desc": "Major shipping routes are blocked or global pandemics halt factory production. Companies relying on complex hardware manufacturing suffer, while local services thrive.",
        "positive_sectors": ["Finance", "Healthcare"], "negative_sectors": ["Industrial", "Technology"], "color": "#d97706"
    }
}

@app.route('/api/research/event_impact', methods=['POST'])
def event_impact():
    data = request.json
    event_type = data.get('event_type')
    event_info = MACRO_LOGIC.get(event_type)
    
    if not event_info:
        return jsonify({"success": False, "message": "Unknown event type."})

    ranked = ranking_svc.compute_rankings()
    recommended = [s for s in ranked if s.get('sector') in event_info['positive_sectors']]
    recommended = sorted(recommended, key=lambda x: -x.get('total_score', 0))[:6]

    return jsonify({"success": True, "event": event_info, "recommendations": recommended})

@app.route('/api/research/live_macro_scan', methods=['GET'])
def live_macro_scan():
    news = news_svc.get_news()
    combined_text = " ".join([n['headline'].lower() for n in news])
    
    active_event = "none"
    if any(word in combined_text for word in ["rate", "fed", "powell", "hike"]):
        active_event = "interest_rate_hike"
    elif any(word in combined_text for word in ["inflation", "cpi", "prices rise"]):
        active_event = "inflation_spike"
    elif any(word in combined_text for word in ["ai", "chip", "nvidia", "artificial intelligence"]):
        active_event = "ai_boom"
    elif any(word in combined_text for word in ["oil", "crude", "opec", "energy"]):
        active_event = "oil_surge"
    elif any(word in combined_text for word in ["war", "missile", "tension", "conflict"]):
        active_event = "global_conflict"

    return jsonify({"success": True, "active_event": active_event})

# ════════════════════════════════════════════════════════════════════════════
# CHATBOT ENDPOINT
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({'reply': 'Please ask a question.'})
        
    reply = chatbot_svc.get_response(user_message)
    return jsonify({'reply': reply})

# ════════════════════════════════════════════════════════════════════════════
# PORTFOLIO BUILDER
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/portfolio/analyze', methods=['POST'])
def analyze_portfolio():
    data = request.json
    holdings = data.get('holdings', [])
    return jsonify(portfolio_svc.analyze_portfolio(holdings))

@app.route('/api/portfolio/save', methods=['POST'])
def save_user_portfolio():
    data = request.json
    user_id = data.get('user_id')
    name = data.get('name', 'My ESG Portfolio')
    portfolio_data = data.get('portfolio', [])
    
    if not user_id:
        return jsonify({'success': False, 'message': 'User ID is required.'})
        
    return jsonify(portfolio_svc.save_portfolio(user_id, name, portfolio_data))

@app.route('/api/portfolio/load', methods=['GET'])
def load_user_portfolio():
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'User ID is required.'})
        
    return jsonify(portfolio_svc.get_user_portfolios(user_id))

@app.route('/api/admin/seed_users', methods=['GET'])
def seed_users():
    dummy_profiles = [
        ("EcoWarrior", "low", "very_high", "5+ years", 50000, ["Clean Energy", "Healthcare"]),
        ("DayTrader", "high", "low", "< 1 year", 150000, ["Technology", "Finance"]),
        ("RetireeBob", "low", "medium", "5+ years", 500000, ["Consumer Staples", "Utilities"]),
        ("TechBro", "high", "low", "1-3 years", 20000, ["Technology"]),
        ("BalancedJane", "moderate", "high", "3-5 years", 75000, ["Clean Energy", "Technology", "Healthcare"])
    ]
    
    count = 0
    for username, risk, esg, dur, budget, sectors in dummy_profiles:
        existing = next((u for u in auth_svc.users.values() if u['username'] == username), None)
        if not existing:
            prefs = {
                'risk_tolerance': risk,
                'esg_priority': esg,
                'duration': dur,
                'budget': budget,
                'sectors': sectors
            }
            auth_svc.register(username, f"{username.lower()}@demo.com", "password123", prefs)
            count += 1
            
    return jsonify({"success": True, "message": f"Successfully added {count} dummy users for clustering."})

import random

@app.route('/api/simulator/trending_topics', methods=['GET', 'OPTIONS'])
def get_trending_topics():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
        
    all_topics = [
        {"icon": "🔥", "label": "Geopolitical Conflict", "query": "Global conflict escalates causing massive supply chain halts"},
        {"icon": "🏦", "label": "Fed Rate Cut", "query": "Federal Reserve announces unexpected 50bps interest rate cut to stimulate economy"},
        {"icon": "🌍", "label": "Carbon Tax Mandate", "query": "Global coalition passes aggressive new carbon tax on all industrial imports"},
        {"icon": "🤖", "label": "AGI Breakthrough", "query": "Tech giants launch AGI model capable of autonomous engineering"},
        {"icon": "🚢", "label": "Supply Chain Freeze", "query": "Major global shipping routes blocked indefinitely after maritime incident"},
        {"icon": "🛢️", "label": "Oil Price Spike", "query": "OPEC+ slashes production, oil prices surge past $100 a barrel"},
        {"icon": "🦠", "label": "Health Crisis", "query": "New highly contagious virus strain forces localized lockdowns globally"},
        {"icon": "⚡", "label": "Green Subsidies", "query": "US and EU pass massive $2 Trillion clean energy and EV subsidy bill"},
        {"icon": "📉", "label": "Commercial Real Estate", "query": "Global real estate markets tumble as massive commercial defaults cascade"},
        {"icon": "📱", "label": "Big Tech Antitrust", "query": "DOJ announces forced breakup of major technology monopolies"},
        {"icon": "🌾", "label": "Agricultural Shortage", "query": "Severe global droughts cause unprecedented wheat and grain shortages"}
    ]
    
    random.shuffle(all_topics)
    trending_today = all_topics[:5]
    
    return jsonify({"success": True, "topics": trending_today})

@app.route('/api/simulator/analyze_news', methods=['POST', 'OPTIONS'])
def analyze_news():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
        
    data = request.json
    news_event = data.get('news_event', '')
    if not news_event: return jsonify({'success': False, 'message': 'Please provide a news event.'})

    event_lower = news_event.lower()
    
    sectors = {
        "Technology": {"impact": 0, "reason": "Standard market exposure."},
        "Energy": {"impact": 0, "reason": "Standard market exposure."},
        "Healthcare": {"impact": 0, "reason": "Standard market exposure."},
        "Finance": {"impact": 0, "reason": "Standard market exposure."},
        "Industrial": {"impact": 0, "reason": "Standard market exposure."},
        "Consumer Staples": {"impact": 0, "reason": "Standard market exposure."}
    }
    trajectory = [0, 0, 0, 0, 0, 0]
    summary = ""
    
    # 1. WAR & GEOPOLITICS
    if any(word in event_lower for word in ["war", "conflict", "tension", "escalate", "military"]):
        summary = f"Geopolitical Conflict Aggregation: Global news wires are flooded with reports regarding '{news_event}'. Historical modeling indicates an immediate 'flight to safety' among institutional investors. Global supply chains will likely face massive chokepoints, driving up commodity costs and forcing governments to increase defense spending. Expect high volatility in equities."
        sectors["Energy"] = {"impact": 25, "reason": "Oil and gas prices spike due to fears of supply disruption and global hoarding."}
        sectors["Industrial"] = {"impact": 18, "reason": "Defense contractors secure massive government contracts, boosting the sector."}
        sectors["Technology"] = {"impact": -15, "reason": "High-growth tech is sold off rapidly as investors move cash to safe-haven assets like gold."}
        sectors["Finance"] = {"impact": -10, "reason": "Global trade instability increases default risk for multinational lenders."}
        sectors["Healthcare"] = {"impact": 5, "reason": "Acts as a defensive, recession-proof anchor during global panic."}
        sectors["Consumer Staples"] = {"impact": 8, "reason": "Panic buying and defensive positioning boost basic goods."}
        trajectory = [-8, -12, -15, -5, 2, 8]
        
    # 2. AI & TECH BREAKTHROUGH
    elif any(word in event_lower for word in ["ai", "model", "agi", "software", "tech", "chip"]):
        summary = f"Technology Super-Cycle Analysis: The announcement of '{news_event}' is triggering a speculative frenzy across global markets. Analysts predict this breakthrough will cause a massive productivity boom, rendering legacy systems obsolete. Capital is flooding into silicon, software, and the energy grids required to power them."
        sectors["Technology"] = {"impact": 38, "reason": "Massive institutional capital inflow betting on a software productivity super-cycle."}
        sectors["Energy"] = {"impact": 15, "reason": "New AI data centers require unprecedented electricity, boosting utility demand."}
        sectors["Industrial"] = {"impact": -8, "reason": "Fears of rapid automation replacing legacy manufacturing jobs trigger sell-offs."}
        sectors["Healthcare"] = {"impact": 12, "reason": "AI integration drastically accelerates drug discovery and operational efficiency."}
        sectors["Finance"] = {"impact": 10, "reason": "Fintech and quantitative trading firms benefit heavily from advanced predictive models."}
        trajectory = [8, 15, 22, 25, 18, 12]
        
    # 3. INTEREST RATES & CENTRAL BANKS
    elif any(word in event_lower for word in ["rate", "fed", "interest", "inflation", "cut", "hike"]):
        summary = f"Monetary Policy Shift: Central bank actions regarding '{news_event}' are instantly repricing the stock market. Changes in the cost of borrowing directly dictate corporate expansion plans. Lower rates will ignite growth sectors, while rate hikes will choke off capital and boost cash-rich legacy companies."
        sectors["Technology"] = {"impact": 22, "reason": "Lower borrowing costs disproportionately boost the valuations of high-growth tech firms."}
        sectors["Finance"] = {"impact": -8, "reason": "Compressed interest rate spreads reduce profit margins on traditional banking loans."}
        sectors["Industrial"] = {"impact": 15, "reason": "Cheaper capital fuels rapid expansion and new infrastructure projects."}
        sectors["Energy"] = {"impact": 5, "reason": "Broad economic stimulation increases overall global energy demand."}
        sectors["Consumer Staples"] = {"impact": -5, "reason": "Investors abandon slow-growth safe havens in favor of aggressive growth assets."}
        trajectory = [5, 10, 15, 12, 10, 8]

    # 4. ESG & CLIMATE MANDATES
    elif any(word in event_lower for word in ["carbon", "climate", "green", "esg", "subsidy", "emissions"]):
        summary = f"Regulatory Climate Action: The news of '{news_event}' signals an aggressive legislative pivot. Governments are weaponizing taxes against heavy polluters while subsidizing the clean-tech transition. This creates highly predictable sector rotations out of fossil fuels and into renewable infrastructure."
        sectors["Energy"] = {"impact": -35, "reason": "Legacy fossil fuel companies face crippling new carbon taxes and stranded assets."}
        sectors["Technology"] = {"impact": 18, "reason": "Clean-tech, smart grid software, and EV platforms receive massive government subsidies."}
        sectors["Industrial"] = {"impact": -15, "reason": "Heavy manufacturing faces skyrocketing compliance and retrofitting costs."}
        sectors["Finance"] = {"impact": -5, "reason": "Banks heavily leveraged in fossil fuel loans face severe default risks."}
        trajectory = [-2, -5, 0, 5, 10, 15]

    # 5. PANDEMIC & HEALTH
    elif any(word in event_lower for word in ["virus", "pandemic", "lockdown", "disease", "outbreak"]):
        summary = f"Global Health Crisis Aggregation: Reports of '{news_event}' are triggering a 'stay-at-home' economic shock. Physical industries, travel, and retail face immediate devastation, while digital infrastructure and medical research receive massive, desperate funding."
        sectors["Healthcare"] = {"impact": 45, "reason": "Unprecedented government funding for vaccines, testing, and medical infrastructure."}
        sectors["Technology"] = {"impact": 28, "reason": "Remote work, cloud computing, and digital entertainment surge during physical lockdowns."}
        sectors["Energy"] = {"impact": -40, "reason": "Global travel halts completely, absolutely destroying global oil demand."}
        sectors["Industrial"] = {"impact": -30, "reason": "Factories shut down and global physical supply chains collapse."}
        trajectory = [-15, -25, -20, -10, 5, 15]

    # 6. SUPPLY CHAIN & LOGISTICS
    elif any(word in event_lower for word in ["supply", "ship", "port", "canal", "shortage"]):
        summary = f"Logistics Chokepoint: The event '{news_event}' has broken a critical link in the global supply chain. Inventory shortages will drive up prices (inflation), hurting companies that rely on physical goods while benefiting domestic producers who can fill the gap."
        sectors["Industrial"] = {"impact": -25, "reason": "Inability to source parts halts manufacturing lines globally."}
        sectors["Consumer Staples"] = {"impact": 15, "reason": "Supermarkets and basic goods see massive price gouging and panic buying."}
        sectors["Technology"] = {"impact": -15, "reason": "Hardware and semiconductor companies cannot ship products, destroying quarterly earnings."}
        sectors["Energy"] = {"impact": 10, "reason": "Localized energy domestic production becomes highly valuable."}
        trajectory = [-10, -15, -12, -5, 0, 5]

    # 7. REGULATORY & ANTITRUST
    elif any(word in event_lower for word in ["sue", "doj", "monopoly", "antitrust", "breakup", "ban"]):
        summary = f"Regulatory Crackdown: Government agencies are targeting corporate monopolies via '{news_event}'. This causes immense fear in mega-cap stocks as investors worry about massive fines or forced company breakups, creating a ripple effect across their specific sector."
        sectors["Technology"] = {"impact": -25, "reason": "Mega-cap tech companies face existential threats from forced breakups and massive fines."}
        sectors["Finance"] = {"impact": -10, "reason": "Strict new regulations halt lucrative mergers and acquisitions (M&A) banking fees."}
        sectors["Industrial"] = {"impact": 5, "reason": "Smaller domestic competitors benefit as monopolies are dismantled."}
        trajectory = [-8, -12, -10, -5, -2, 0]

    # 8. COMMODITY SHOCK (OPEC/GOLD/AGRICULTURE)
    elif any(word in event_lower for word in ["opec", "oil", "gold", "wheat", "crop"]):
        summary = f"Commodity Shock: The news '{news_event}' indicates a massive disruption in raw materials. Since commodities are the building blocks of the economy, a price spike here acts as a tax on every other industry, crushing margins for manufacturers while making extractors incredibly rich."
        sectors["Energy"] = {"impact": 35, "reason": "Direct constraint on raw materials allows energy companies to charge massive premiums."}
        sectors["Industrial"] = {"impact": -20, "reason": "Input costs for raw materials skyrocket, completely destroying manufacturing profit margins."}
        sectors["Consumer Staples"] = {"impact": -12, "reason": "Food and basic goods companies are forced to pass high costs to consumers, hurting sales."}
        trajectory = [-5, -8, -5, 0, 2, 5]

    # 9. REAL ESTATE & HOUSING
    elif any(word in event_lower for word in ["housing", "mortgage", "real estate", "rent", "default"]):
        summary = f"Housing Market Contagion: Instability regarding '{news_event}' threatens the bedrock of consumer wealth: real estate. If property values crash, consumer spending dies, and banks holding bad mortgages face insolvency. The ripple effects are highly destructive."
        sectors["Finance"] = {"impact": -35, "reason": "Banks are left holding billions in toxic, defaulted mortgage debt."}
        sectors["Industrial"] = {"impact": -20, "reason": "New home construction halts, devastating lumber, steel, and heavy machinery."}
        sectors["Consumer Staples"] = {"impact": -10, "reason": "Consumers facing foreclosure drastically cut all non-essential spending."}
        trajectory = [-10, -18, -25, -20, -15, -10]

    # 10. CONSUMER RETAIL / EARNINGS
    elif any(word in event_lower for word in ["retail", "consumer", "spend", "earnings", "holiday"]):
        summary = f"Consumer Sentiment Shift: News surrounding '{news_event}' indicates a shift in how average citizens are spending their money. Since consumer spending drives 70% of the economy, this data acts as a massive leading indicator for overall market health."
        sectors["Consumer Staples"] = {"impact": 20, "reason": "Strong retail data indicates consumers are willing to absorb higher prices."}
        sectors["Technology"] = {"impact": 15, "reason": "Consumer electronics and e-commerce platforms see massive volume spikes."}
        sectors["Finance"] = {"impact": 10, "reason": "Credit card companies process record transactions, raking in swipe fees."}
        trajectory = [5, 8, 12, 10, 8, 5]

    # 11. GENERIC FALLBACK FOR CUSTOM INPUTS
    else:
        summary = f"Algorithmic Risk Assessment: The guidance system has processed the headline '{news_event}'. Because this event does not match a highly defined historical macro-shock pattern, the AI has distributed impact based on generalized sector beta and current market volatility."
        sectors["Technology"] = {"impact": random.randint(-15, 15), "reason": "Algorithmic adjustment based on market beta exposure."}
        sectors["Energy"] = {"impact": random.randint(-15, 15), "reason": "Commodity price sensitivity adjustment."}
        sectors["Finance"] = {"impact": random.randint(-15, 15), "reason": "Credit flow recalculation."}
        sectors["Healthcare"] = {"impact": random.randint(-5, 10), "reason": "Defensive weighting applied."}
        sectors["Industrial"] = {"impact": random.randint(-15, 15), "reason": "Supply chain exposure adjustment."}
        trajectory = [random.randint(-5,5) for _ in range(6)]

    impact_data = []
    for sec, data in sectors.items():
        impact_data.append({"sector": sec, "impact": data["impact"], "reasoning": data["reason"]})
    impact_data = sorted(impact_data, key=lambda x: x["impact"], reverse=True)

    return jsonify({
        'success': True, 'summary': summary, 'sector_analysis': impact_data,
        'trajectory': trajectory, 'months': ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
    })

scheme_svc = SchemeService()


# ════════════════════════════════════════════════════════════════════════════
# GOVT SCHEME INTELLIGENCE ENDPOINT
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/investments/schemes', methods=['POST', 'OPTIONS'])
def recommend_schemes():
    # 1. Handle the CORS preflight request from React
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
        
    # 2. Handle the actual data request
    try:
        data = request.json
        result = scheme_svc.fetch_personalized_schemes(data)
        return jsonify(result)
    except Exception as e:
        print(f"SCHEME ERROR: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    
    # --- Add where you initialize services ---
insurance_svc = InsuranceService()
retirement_svc = RetirementService()

# --- Add this new endpoint ---
@app.route('/api/investments/insurance', methods=['POST', 'OPTIONS'])
def compare_insurance():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        data = request.json
        result = insurance_svc.compare_policies(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/investments/insurance/advanced', methods=['POST', 'OPTIONS'])
def run_insurance_engine():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        data = request.json
        result = insurance_svc.run_advanced_analysis(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    
# ════════════════════════════════════════════════════════════════════════════
# RETIREMENT PLANNING ENDPOINTS (DB & ML INTEGRATED)
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/retirement/predict', methods=['POST', 'OPTIONS'])
@app.route('/api/retirement/analyze', methods=['POST', 'OPTIONS'])
def analyze_retirement_handler():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        data = request.json
        result = retirement_svc.analyze_retirement(data)
        return jsonify({"status": "success", "outputs": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/retirement/save', methods=['POST', 'OPTIONS'])
def save_retirement_handler():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        data = request.json
        # Map user logic - default to 'guest' if not logged in
        user_id = str(data.get('user_id', 'guest')) 
        plan_data = data.get('plan_data')
        
        result = retirement_svc.save_plan(user_id, plan_data)
        return jsonify(result), 200
    except Exception as e:
        import traceback
        print(f"SAVE ERROR: {traceback.format_exc()}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/retirement/saved', methods=['GET', 'OPTIONS'])
def get_saved_retirement_handler():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        user_id = str(request.args.get('user_id', 'guest'))
        result = retirement_svc.get_saved_plans(user_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ════════════════════════════════════════════════════════════════════════════
# ML PERSONALIZED ASSET ALLOCATION ENDPOINT
# ════════════════════════════════════════════════════════════════════════════
@app.route('/api/ml/recommend_allocation', methods=['POST', 'OPTIONS'])
def ml_recommend_allocation_handler(): 
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
        
    try:
        data = request.json
        # Map frontend keys to the ML model's expected profile format
        profile = {
            'age': float(data.get('age', 30)),
            'annual_income': float(data.get('annual_income', 1000000)),
            'tax_bracket': float(data.get('tax_bracket', 30.0)),
            'risk_profile': 'Aggressive' if data.get('risk_tolerance') == 'high' else 'Conservative' if data.get('risk_tolerance') == 'low' else 'Moderate',
            'financial_goal': data.get('financial_goal', 'Wealth Creation'),
            'investment_horizon': 'Short Term' if '<' in data.get('duration', '') else 'Long Term' if '+' in data.get('duration', '') else 'Medium Term',
            'esg_preference': 'High' if data.get('esg_priority') in ['high', 'very_high'] else 'Low' if data.get('esg_priority') == 'low' else 'Medium',
            'health_risk': data.get('health_risk', 'Low')
        }
        
        # Call the KNN Regressor from MLRecommendationService
        result = ml_rec_svc.get_recommendations(profile)
        return jsonify(result)
    except Exception as e:
        import traceback
        print(f"🚨 ALLOCATION ERROR:\n{traceback.format_exc()}")
        return jsonify({'success': False, 'message': str(e)}), 500


if __name__ == '__main__':
    print("🚀 ESG Investment Platform starting on http://localhost:5000")
    app.run(debug=True, port=5000)