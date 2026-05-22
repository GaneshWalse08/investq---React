# from flask import Blueprint, jsonify
# from services.sentiment_service import get_market_sentiment, get_stock_sentiment
# from services.data_service import get_stock_data, MOCK_STOCKS
# from services.metrics_service import calculate_metrics
# from services.esg_service import get_esg_data
# from ml.prediction_engine import predict_signal

# dashboard_bp = Blueprint('dashboard', __name__)

# @dashboard_bp.route('/', methods=['GET'])
# def dashboard():
#     market = get_market_sentiment()
#     top_symbols = ['NVDA', 'MSFT', 'AAPL', 'NEE', 'COST']
#     raw = get_stock_data(top_symbols)
#     top_stocks = []
#     for symbol, data in raw.items():
#         metrics = calculate_metrics(data.get('dailyReturns', []), data.get('allPrices', []))
#         esg = get_esg_data(symbol)
#         signal = predict_signal(metrics, esg)
#         top_stocks.append({
#             'symbol': symbol,
#             'name': data['name'],
#             'price': data['currentPrice'],
#             'change': data['change'],
#             'signal': signal['signal'],
#             'esgRating': esg['esgRating'],
#             'sharpe': metrics.get('sharpeRatio', 0),
#         })

#     return jsonify({'marketSentiment': market, 'topStocks': top_stocks})


import json
import os
from flask import Blueprint, jsonify
from services.sentiment_service import get_market_sentiment, get_stock_sentiment
from services.data_service import get_stock_data, MOCK_STOCKS
from services.metrics_service import calculate_metrics
from services.esg_service import get_esg_data
from ml.prediction_engine import predict_signal
from services.clustering_service import ClusteringService

dashboard_bp = Blueprint('dashboard', __name__)
clustering_service = ClusteringService()

# Helper to load real users from your JSON database
def load_real_users():
    try:
        # Assuming users are stored in backend/data/users.json based on your README
        filepath = os.path.join(os.path.dirname(__file__), '..', 'data', 'users.json')
        with open(filepath, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading users: {e}")
        return []

@dashboard_bp.route('/', methods=['GET'])
def dashboard():
    market = get_market_sentiment()
    top_symbols = ['NVDA', 'MSFT', 'AAPL', 'NEE', 'COST']
    raw = get_stock_data(top_symbols)
    top_stocks = []
    for symbol, data in raw.items():
        metrics = calculate_metrics(data.get('dailyReturns', []), data.get('allPrices', []))
        esg = get_esg_data(symbol)
        signal = predict_signal(metrics, esg)
        top_stocks.append({
            'symbol': symbol,
            'name': data['name'],
            'price': data['currentPrice'],
            'change': data['change'],
            'signal': signal['signal'],
            'esgRating': esg['esgRating'],
            'sharpe': metrics.get('sharpeRatio', 0),
        })

    return jsonify({'marketSentiment': market, 'topStocks': top_stocks})

@dashboard_bp.route('/community-stats', methods=['GET'])
def community_stats():
    users = load_real_users()
    
    # Initialize empty graph data
    response_data = {
        "userCount": len(users),
        "personas": [],
        "riskDistribution": [
            {"name": "Low (Conservative)", "users": 0},
            {"name": "Moderate (Balanced)", "users": 0},
            {"name": "High (Aggressive)", "users": 0}
        ],
        "esgDistribution": [
            {"name": "Low (Returns)", "users": 0},
            {"name": "Medium (Balanced)", "users": 0},
            {"name": "High (Impact)", "users": 0},
            {"name": "Very High (Strict)", "users": 0}
        ],
        "error": None
    }

    # Tally up the simple distributions (Risk and ESG) for all users
    for u in users:
        prefs = u.get('preferences', {})
        risk = prefs.get('risk_tolerance', 'moderate')
        esg = prefs.get('esg_priority', 'medium')
        
        if risk == 'low': response_data["riskDistribution"][0]["users"] += 1
        elif risk == 'moderate': response_data["riskDistribution"][1]["users"] += 1
        elif risk == 'high': response_data["riskDistribution"][2]["users"] += 1
        
        if esg == 'low': response_data["esgDistribution"][0]["users"] += 1
        elif esg == 'medium': response_data["esgDistribution"][1]["users"] += 1
        elif esg == 'high': response_data["esgDistribution"][2]["users"] += 1
        elif esg == 'very_high': response_data["esgDistribution"][3]["users"] += 1

    # Run the K-Means clustering algorithm
    cluster_results = clustering_service.cluster_investors(users)
    
    if 'error' in cluster_results:
        # Scikit-learn requires at least 3 users to cluster
        response_data["error"] = cluster_results['error'] 
    else:
        # Map the cluster results to the Recharts format for the Pie Chart
        personas_data = []
        sizes = cluster_results.get('cluster_sizes', {})
        personas_info = cluster_results.get('personas', {})
        
        for cluster_id, count in sizes.items():
            info = personas_info.get(cluster_id, {})
            if count > 0:
                personas_data.append({
                    "name": info.get('name', f"Cluster {cluster_id}"),
                    "value": count,
                    "color": info.get('color', '#8884d8')
                })
        response_data["personas"] = personas_data

    return jsonify(response_data), 200