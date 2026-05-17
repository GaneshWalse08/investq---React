# backend/routes/retirement.py
from flask import Blueprint, request, jsonify
from services.retirement_service import RetirementService

retirement_bp = Blueprint('retirement', __name__)
retirement_service = RetirementService()

@retirement_bp.route('/analyze', methods=['POST'])
def analyze_retirement():
    try:
        data = request.json
        result = retirement_service.analyze_retirement(data)
        return jsonify({"status": "success", "data": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500