from flask import Blueprint, request, jsonify
import jwt
import hashlib
import json
import os
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = 'investiq-secret-key-2024'
USERS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'users.json')

def load_users():
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({}, f)
    with open(USERS_FILE) as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    risk = data.get('riskTolerance', 'moderate')
    esg = data.get('esgPreference', 50)

    if not username or not email or not password:
        return jsonify({'error': 'All fields required'}), 400

    users = load_users()
    if email in users:
        return jsonify({'error': 'Email already registered'}), 409

    users[email] = {
        'username': username,
        'email': email,
        'password': hash_password(password),
        'riskTolerance': risk,
        'esgPreference': esg,
        'createdAt': datetime.utcnow().isoformat(),
        'savedStocks': [],
        'portfolioHistory': []
    }
    save_users(users)

    token = jwt.encode({'email': email, 'exp': datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm='HS256')
    return jsonify({'token': token, 'user': {'username': username, 'email': email, 'riskTolerance': risk, 'esgPreference': esg}})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip()
    password = data.get('password', '')

    users = load_users()
    user = users.get(email)
    if not user or user['password'] != hash_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({'email': email, 'exp': datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm='HS256')
    return jsonify({'token': token, 'user': {
        'username': user['username'], 'email': email,
        'riskTolerance': user.get('riskTolerance', 'moderate'),
        'esgPreference': user.get('esgPreference', 50)
    }})

@auth_bp.route('/profile', methods=['GET'])
def profile():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        users = load_users()
        user = users.get(payload['email'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'username': user['username'], 'email': payload['email'],
                        'riskTolerance': user.get('riskTolerance', 'moderate'),
                        'esgPreference': user.get('esgPreference', 50)})
    except Exception:
        return jsonify({'error': 'Invalid token'}), 401

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        users = load_users()
        user = users.get(payload['email'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        data = request.json
        user['riskTolerance'] = data.get('riskTolerance', user['riskTolerance'])
        user['esgPreference'] = data.get('esgPreference', user['esgPreference'])
        save_users(users)
        return jsonify({'message': 'Profile updated'})
    except Exception:
        return jsonify({'error': 'Invalid token'}), 401
