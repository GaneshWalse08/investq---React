from flask import Blueprint, request, jsonify
from services.data_service import get_stock_data
from services.portfolio_service import optimize_portfolio, run_backtest
from services.metrics_service import calculate_portfolio_metrics
from services.esg_service import get_esg_data

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/optimize', methods=['POST'])
def optimize():
    data = request.json
    symbols = data.get('symbols', [])
    if len(symbols) < 2:
        return jsonify({'error': 'Need at least 2 symbols'}), 400

    raw = get_stock_data(symbols)
    returns_matrix = [raw[s]['dailyReturns'] for s in symbols if s in raw]
    valid_symbols = [s for s in symbols if s in raw]

    if len(valid_symbols) < 2:
        return jsonify({'error': 'Insufficient data'}), 400

    result = optimize_portfolio(returns_matrix, valid_symbols)
    return jsonify(result)

@portfolio_bp.route('/backtest', methods=['POST'])
def backtest():
    data = request.json
    weights = data.get('weights', {})
    symbols = list(weights.keys())

    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400

    raw = get_stock_data(symbols)
    all_prices = {s: raw[s]['allPrices'] for s in symbols if s in raw}
    result = run_backtest(all_prices, weights)
    return jsonify(result)

@portfolio_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    holdings = data.get('holdings', {})
    symbols = list(holdings.keys())

    if not symbols:
        return jsonify({'error': 'No holdings'}), 400

    raw = get_stock_data(symbols)
    returns_matrix = [raw[s]['dailyReturns'] for s in symbols if s in raw]
    total_value = sum(holdings.values())
    weights = [holdings.get(s, 0) / total_value for s in symbols if s in raw]

    metrics = calculate_portfolio_metrics(weights, returns_matrix)

    esg_scores = [get_esg_data(s)['esgScore'] for s in symbols]
    avg_esg = sum(esg_scores) / len(esg_scores) if esg_scores else 0

    allocation = {s: round(holdings.get(s, 0) / total_value * 100, 2) for s in symbols}

    return jsonify({
        'metrics': metrics,
        'esgScore': round(avg_esg, 1),
        'allocation': allocation,
        'totalValue': total_value,
    })
