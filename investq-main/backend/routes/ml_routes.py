from flask import Blueprint, request, jsonify
from services.ml_recommendation_service import MLRecommendationService

ml_bp = Blueprint('ml', __name__)
ml_recommendation_service = MLRecommendationService()

@ml_bp.route('/recommend_allocation', methods=['POST'])
def recommend_allocation():
    try:
        data = request.json
        result = ml_recommendation_service.get_recommendations(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500