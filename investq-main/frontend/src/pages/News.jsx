import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function News() {
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        // Fetch both endpoints concurrently, just like your vanilla JS Promise.all
        const [newsRes, sentRes] = await Promise.all([
          api.get('/news'),
          api.get('/news/sentiment')
        ]);
        setNews(newsRes.data);
        setSentiment(sentRes.data);
      } catch (err) {
        console.error("News Error:", err);
        setError("Failed to load market news and sentiment data.");
      } finally {
        setLoading(false);
      }
    };
    fetchNewsData();
  }, []);

  if (loading) return <div className="loading">Loading News & Sentiment...</div>;
  if (error) return <div className="loading" style={{ color: 'var(--rust)' }}>🚨 {error}</div>;

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Market News & Sentiment</h1>
        <p>AI-analyzed financial headlines with sentiment scoring.</p>
        
        <div className="explain-box" style={{ marginTop: '1rem', maxWidth: '850px' }}>
          <strong style={{ fontSize: '0.95rem' }}>🧠 How this works:</strong> Our AI reads live headlines and scores them from -1.0 to +1.0.<br />
          <div style={{ marginTop: '0.4rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>🟢 <strong>Positive:</strong> Score &gt; 0.1</span>
            <span>🔴 <strong>Negative:</strong> Score &lt; -0.1</span>
            <span>🟡 <strong>Neutral:</strong> Between -0.1 and 0.1</span>
          </div>
        </div>
      </div>

      <div className="cards-row cards-4">
        <div className="card">
          <div className="card-title">Overall Sentiment</div>
          <div className="card-value">{sentiment?.market_mood || '—'}</div>
        </div>
        <div className="card">
          <div className="card-title">Positive Articles</div>
          <div className="card-value pos">{sentiment?.positive_count || 0}</div>
        </div>
        <div className="card">
          <div className="card-title">Negative Articles</div>
          <div className="card-value neg">{sentiment?.negative_count || 0}</div>
        </div>
        <div className="card">
          <div className="card-title">Fear & Greed Index</div>
          <div className="card-value">{sentiment?.fear_greed_index || '—'}</div>
        </div>
      </div>

      <div className="chart-card" style={{ background: '#fdfaf4', borderLeft: '4px solid var(--gold)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🤖</span> AI Market Verdict & Analysis
        </h3>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: sentiment?.market_verdict || 'No verdict available.' }} />
      </div>

      <div className="chart-card">
        <h3>All Headlines</h3>
        <div>
          {news.length === 0 ? (
            <div className="loading">No news available.</div>
          ) : (
            news.map((n, idx) => (
              <div key={idx} className="news-item" style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--mist)' }}>
                <div className="news-headline" style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.3rem', lineHeight: 1.4 }}>{n.headline}</div>
                <div className="news-meta" style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', color: 'var(--smoke)', alignItems: 'center' }}>
                  <span className="news-sentiment" style={{
                    padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 700,
                    background: n.sentiment_label === 'Positive' ? '#dcfce7' : n.sentiment_label === 'Negative' ? '#fee2e2' : '#f3f4f6',
                    color: n.sentiment_label === 'Positive' ? '#166534' : n.sentiment_label === 'Negative' ? '#991b1b' : '#6b7280'
                  }}>
                    {n.sentiment_label} {n.sentiment_pct}%
                  </span>
                  <span>{n.source}</span>
                  <span>{n.category}</span>
                  {n.ticker && <span><strong>{n.ticker}</strong></span>}
                  <span>{n.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}