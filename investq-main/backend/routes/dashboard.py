from flask import Blueprint, jsonify
from services.sentiment_service import get_market_sentiment, get_stock_sentiment
from services.data_service import get_stock_data, MOCK_STOCKS
from services.metrics_service import calculate_metrics
from services.esg_service import get_esg_data
from ml.prediction_engine import predict_signal

dashboard_bp = Blueprint('dashboard', __name__)

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
