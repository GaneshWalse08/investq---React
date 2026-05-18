from flask import Blueprint, request, jsonify
from services.retirement_service import RetirementService
import traceback

retirement_bp = Blueprint('retirement', __name__)
retirement_service = RetirementService()

@retirement_bp.route('/predict', methods=['POST'])
@retirement_bp.route('/analyze', methods=['POST'])
def analyze_retirement():
    try:
        data = request.json
        result = retirement_service.analyze_retirement(data)
        return jsonify({"status": "success", "outputs": result}), 200
    except Exception as e:
        print("🚨 RETIREMENT ROUTE ERROR:", traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 500