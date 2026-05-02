from flask import Blueprint, request, jsonify
from services.sentiment_service import get_stock_sentiment, get_market_sentiment

sentiment_bp = Blueprint('sentiment', __name__)

@sentiment_bp.route('/market', methods=['GET'])
def market():
    return jsonify(get_market_sentiment())

@sentiment_bp.route('/<symbol>', methods=['GET'])
def stock_sentiment(symbol):
    return jsonify(get_stock_sentiment(symbol.upper()))
