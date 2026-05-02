import numpy as np

def predict_signal(metrics, esg_data, risk_tolerance='moderate'):
    """
    Rule-based + scoring ML signal generator.
    Returns INVEST, HOLD, or SELL with explanation.
    """
    score = 0
    reasons = []
    warnings = []

    annual_return = metrics.get('annualReturn', 0)
    volatility = metrics.get('volatility', 50)
    sharpe = metrics.get('sharpeRatio', 0)
    max_dd = metrics.get('maxDrawdown', -50)
    esg = esg_data.get('esgScore', 50)

    # Return scoring
    if annual_return > 20:
        score += 25
        reasons.append('Strong annual return (>20%)')
    elif annual_return > 10:
        score += 15
        reasons.append('Solid annual return (>10%)')
    elif annual_return > 0:
        score += 5
    else:
        score -= 15
        warnings.append('Negative annual return')

    # Volatility scoring (risk tolerance aware)
    vol_thresholds = {'conservative': (15, 25), 'moderate': (20, 35), 'aggressive': (30, 50)}
    low_v, high_v = vol_thresholds.get(risk_tolerance, (20, 35))
    if volatility < low_v:
        score += 20
        reasons.append(f'Low volatility ({volatility:.1f}%)')
    elif volatility < high_v:
        score += 10
    else:
        score -= 10
        warnings.append(f'High volatility ({volatility:.1f}%)')

    # Sharpe ratio
    if sharpe > 1.5:
        score += 25
        reasons.append(f'Excellent Sharpe ratio ({sharpe:.2f})')
    elif sharpe > 1.0:
        score += 15
        reasons.append(f'Good Sharpe ratio ({sharpe:.2f})')
    elif sharpe > 0.5:
        score += 5
    else:
        score -= 10
        warnings.append('Poor risk-adjusted returns')

    # Max drawdown
    if max_dd > -10:
        score += 15
        reasons.append('Minimal drawdown risk')
    elif max_dd > -20:
        score += 5
    else:
        score -= 10
        warnings.append(f'Large max drawdown ({max_dd:.1f}%)')

    # ESG score
    if esg > 75:
        score += 15
        reasons.append(f'Strong ESG profile ({esg:.0f}/100)')
    elif esg > 55:
        score += 8
        reasons.append(f'Moderate ESG profile ({esg:.0f}/100)')
    else:
        score -= 5
        warnings.append('Below-average ESG score')

    # Signal decision
    if score >= 55:
        signal = 'INVEST'
        confidence = min(95, 60 + score * 0.5)
    elif score >= 25:
        signal = 'HOLD'
        confidence = min(90, 50 + abs(score) * 0.4)
    else:
        signal = 'SELL'
        confidence = min(90, 50 + abs(score - 25) * 0.5)

    return {
        'signal': signal,
        'confidence': round(confidence, 1),
        'score': score,
        'reasons': reasons,
        'warnings': warnings,
    }

def cluster_investor(risk_tolerance, esg_preference, budget, duration):
    """Classify investor into Conservative / Balanced / Aggressive."""
    risk_map = {'conservative': 1, 'moderate': 2, 'aggressive': 3}
    risk_val = risk_map.get(risk_tolerance, 2)

    duration_score = 1 if duration <= 1 else (2 if duration <= 5 else 3)
    budget_score = 1 if budget < 5000 else (2 if budget < 50000 else 3)
    esg_score = 1 if esg_preference > 70 else (2 if esg_preference > 40 else 3)

    cluster_score = risk_val * 0.4 + duration_score * 0.3 + budget_score * 0.2 + (4 - esg_score) * 0.1

    if cluster_score < 1.8:
        return {'cluster': 'Conservative', 'description': 'Prefers capital preservation, low risk, stable returns'}
    elif cluster_score < 2.4:
        return {'cluster': 'Balanced', 'description': 'Mix of growth and stability, moderate risk tolerance'}
    else:
        return {'cluster': 'Aggressive', 'description': 'Growth-focused, comfortable with high risk and volatility'}
