from flask import Blueprint, request, jsonify
from services.data_service import get_stock_data, MOCK_STOCKS
from services.metrics_service import calculate_metrics
from services.esg_service import get_esg_data
from services.ranking_service import rank_stocks
from services.sentiment_service import get_stock_sentiment
from ml.prediction_engine import predict_signal, cluster_investor

stocks_bp = Blueprint('stocks', __name__)

DEFAULT_SYMBOLS = list(MOCK_STOCKS.keys())

def enrich_stock(symbol, data, risk_tolerance='moderate'):
    metrics = calculate_metrics(data.get('dailyReturns', []), data.get('allPrices', []))
    esg_data = get_esg_data(symbol)
    signal_data = predict_signal(metrics, esg_data, risk_tolerance)
    return {**data, 'metrics': metrics, 'esgData': esg_data, 'signal': signal_data}

@stocks_bp.route('/', methods=['GET'])
def get_stocks():
    symbols_param = request.args.get('symbols', '')
    risk = request.args.get('risk', 'moderate')
    esg_pref = int(request.args.get('esgPref', 50))
    symbols = symbols_param.split(',') if symbols_param else DEFAULT_SYMBOLS
    symbols = [s.strip().upper() for s in symbols if s.strip()][:15]

    raw = get_stock_data(symbols)
    enriched = {s: enrich_stock(s, d, risk) for s, d in raw.items()}

    user_prefs = {'riskTolerance': risk, 'esgPreference': esg_pref}
    ranked = rank_stocks(enriched, user_prefs)
    return jsonify(ranked)

@stocks_bp.route('/<symbol>', methods=['GET'])
def get_stock(symbol):
    symbol = symbol.upper()
    risk = request.args.get('risk', 'moderate')
    raw = get_stock_data([symbol])
    if symbol not in raw:
        return jsonify({'error': 'Stock not found'}), 404
    enriched = enrich_stock(symbol, raw[symbol], risk)
    sentiment = get_stock_sentiment(symbol)
    enriched['sentiment'] = sentiment
    return jsonify(enriched)

@stocks_bp.route('/search', methods=['GET'])
def search_stocks():
    query = request.args.get('q', '').upper()
    results = [
        {'symbol': s, 'name': info['name'], 'sector': info['sector']}
        for s, info in MOCK_STOCKS.items()
        if query in s or query in info['name'].upper()
    ]
    return jsonify(results)

@stocks_bp.route('/cluster', methods=['POST'])
def cluster():
    data = request.json
    result = cluster_investor(
        data.get('riskTolerance', 'moderate'),
        data.get('esgPreference', 50),
        data.get('budget', 10000),
        data.get('duration', 5)
    )
    return jsonify(result)
