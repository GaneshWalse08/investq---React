import random
from datetime import datetime, timedelta

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    analyzer = SentimentIntensityAnalyzer()
    VADER_AVAILABLE = True
except ImportError:
    VADER_AVAILABLE = False

MOCK_HEADLINES = {
    'AAPL': [
        "Apple reports record iPhone sales amid strong holiday demand",
        "Apple Vision Pro gains traction in enterprise market",
        "Apple services revenue surges to all-time high",
        "Supply chain concerns weigh on Apple outlook",
        "Apple AI integration drives upgrade cycle",
    ],
    'MSFT': [
        "Microsoft Azure cloud growth accelerates to 29% annually",
        "Copilot AI adoption drives enterprise license growth",
        "Microsoft gaming division sees strong Xbox performance",
        "Regulatory scrutiny continues over Activision integration",
        "Microsoft Teams gains market share against Slack",
    ],
    'TSLA': [
        "Tesla cuts prices across lineup to boost demand",
        "Tesla FSD beta shows remarkable progress in testing",
        "Tesla Cybertruck deliveries begin, demand uncertain",
        "Competition from Chinese EV makers pressures Tesla margins",
        "Tesla energy business growing faster than automotive",
    ],
    'NVDA': [
        "NVIDIA H100 demand far outstrips supply amid AI boom",
        "NVIDIA announces next-gen Blackwell architecture chips",
        "Data center revenue triples year-over-year for NVIDIA",
        "NVIDIA expands into enterprise AI software market",
        "Export restrictions create headwinds for NVIDIA China sales",
    ],
}

GENERIC_HEADLINES = [
    "Company reports strong quarterly earnings beat",
    "Analyst upgrades stock citing strong fundamentals",
    "Insider buying activity increases investor confidence",
    "Macroeconomic headwinds weigh on sector outlook",
    "Company announces strategic partnership deal",
]

def analyze_text_sentiment(text):
    if VADER_AVAILABLE:
        scores = analyzer.polarity_scores(text)
        compound = scores['compound']
    else:
        # Mock sentiment
        random.seed(hash(text) % 10000)
        compound = random.uniform(-0.6, 0.8)

    if compound >= 0.05:
        label = 'positive'
    elif compound <= -0.05:
        label = 'negative'
    else:
        label = 'neutral'

    return {'score': round(compound, 3), 'label': label}

def get_stock_sentiment(symbol):
    headlines = MOCK_HEADLINES.get(symbol, GENERIC_HEADLINES)
    results = []
    total_score = 0

    base_date = datetime.now()
    for i, headline in enumerate(headlines):
        sentiment = analyze_text_sentiment(headline)
        total_score += sentiment['score']
        date = (base_date - timedelta(days=i)).strftime('%Y-%m-%d')
        results.append({'headline': headline, 'date': date, **sentiment})

    avg_score = total_score / len(results) if results else 0
    if avg_score > 0.1:
        mood = 'Bullish'
    elif avg_score < -0.1:
        mood = 'Bearish'
    else:
        mood = 'Neutral'

    return {
        'symbol': symbol,
        'articles': results,
        'averageScore': round(avg_score, 3),
        'marketMood': mood,
        'sentimentDistribution': {
            'positive': sum(1 for r in results if r['label'] == 'positive'),
            'neutral': sum(1 for r in results if r['label'] == 'neutral'),
            'negative': sum(1 for r in results if r['label'] == 'negative'),
        }
    }

def get_market_sentiment():
    symbols = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL']
    all_scores = []
    for s in symbols:
        data = get_stock_sentiment(s)
        all_scores.append(data['averageScore'])

    market_avg = sum(all_scores) / len(all_scores)
    fear_greed = int((market_avg + 1) / 2 * 100)  # map -1..1 to 0..100

    if fear_greed > 70:
        fg_label = 'Extreme Greed'
    elif fear_greed > 55:
        fg_label = 'Greed'
    elif fear_greed > 45:
        fg_label = 'Neutral'
    elif fear_greed > 30:
        fg_label = 'Fear'
    else:
        fg_label = 'Extreme Fear'

    return {
        'fearGreedIndex': fear_greed,
        'fearGreedLabel': fg_label,
        'marketMood': 'Bullish' if market_avg > 0.1 else ('Bearish' if market_avg < -0.1 else 'Neutral'),
        'averageSentiment': round(market_avg, 3),
    }
