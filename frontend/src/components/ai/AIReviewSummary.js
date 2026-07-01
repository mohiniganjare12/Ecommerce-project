import { useState } from 'react';

export default function AIReviewSummary({ reviews, productName }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    if (!reviews || reviews.length === 0) return;
    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const reviewText = reviews.slice(0, 15).map(r =>
        `Rating: ${r.rating}/5 - "${r.comment}"${r.verifiedPurchase ? ' [Verified Purchase]' : ''}`
      ).join('\n');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a review analyst. Analyze product reviews and respond ONLY with a JSON object (no markdown):
{
  "verdict": "Highly Recommended" | "Recommended" | "Mixed Reviews" | "Not Recommended",
  "score": number (0-100),
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "summary": "2-sentence summary",
  "buyAdvice": "one-sentence buying advice"
}`,
          messages: [{
            role: 'user',
            content: `Product: ${productName}\n\nReviews:\n${reviewText}`
          }],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      setSummary(parsed);
    } catch {
      setError('Could not generate AI summary. Please try again.');
    } finally { setLoading(false); }
  };

  const verdictColors = {
    'Highly Recommended': '#16A34A',
    'Recommended': '#2563EB',
    'Mixed Reviews': '#D97706',
    'Not Recommended': '#DC2626',
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <div style={styles.wrapper}>
      {!summary && !loading && (
        <button style={styles.trigger} onClick={generateSummary}>
          <span>✨</span>
          <span>Summarize {reviews.length} reviews with AI</span>
          <span style={styles.badge}>New</span>
        </button>
      )}

      {loading && (
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI is analyzing reviews...</span>
        </div>
      )}

      {error && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', padding: '12px' }}>{error}</p>}

      {summary && (
        <div style={styles.summary}>
          <div style={styles.summaryHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              <div>
                <div style={styles.summaryTitle}>AI Review Summary</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on {reviews.length} reviews</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...styles.verdict, color: verdictColors[summary.verdict] || 'var(--text-primary)' }}>
                {summary.verdict}
              </div>
              <div style={styles.scoreBar}>
                <div style={{ ...styles.scoreFill, width: `${summary.score}%`, background: verdictColors[summary.verdict] || 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{summary.score}/100</div>
            </div>
          </div>

          <p style={styles.summaryText}>{summary.summary}</p>

          <div style={styles.prosConsGrid}>
            <div>
              <div style={styles.prosConsLabel}>
                <span>✅</span> What customers love
              </div>
              {summary.pros?.map((p, i) => <div key={i} style={styles.proItem}>• {p}</div>)}
            </div>
            {summary.cons?.length > 0 && (
              <div>
                <div style={styles.prosConsLabel}>
                  <span>⚠️</span> Concerns
                </div>
                {summary.cons?.map((c, i) => <div key={i} style={styles.conItem}>• {c}</div>)}
              </div>
            )}
          </div>

          {summary.buyAdvice && (
            <div style={styles.buyAdvice}>
              <span>💡</span> <strong>Buying tip:</strong> {summary.buyAdvice}
            </div>
          )}

          <button style={styles.refreshBtn} onClick={() => setSummary(null)}>
            Regenerate summary
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { marginBottom: '2rem' },
  trigger: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 20px', borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(220,38,38,0.06))',
    border: '1.5px solid rgba(124,58,237,0.2)',
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
    color: 'var(--text-primary)', transition: 'var(--transition)',
    width: '100%', justifyContent: 'center',
  },
  badge: {
    background: 'linear-gradient(135deg, #7C3AED, #DC2626)',
    color: '#fff', padding: '2px 8px', borderRadius: '20px',
    fontSize: '0.68rem', fontWeight: '700',
  },
  loading: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' },
  spinner: { width: '20px', height: '20px', border: '2px solid var(--border)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 },
  summary: {
    background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(220,38,38,0.04))',
    border: '1.5px solid rgba(124,58,237,0.15)',
    borderRadius: 'var(--radius-lg)', padding: '1.5rem',
  },
  summaryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' },
  summaryTitle: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1rem' },
  verdict: { fontWeight: '700', fontSize: '0.9rem' },
  scoreBar: { width: '80px', height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '6px' },
  scoreFill: { height: '100%', borderRadius: '2px', transition: 'width 0.8s ease' },
  summaryText: { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' },
  prosConsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  prosConsLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '8px' },
  proItem: { fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.5' },
  conItem: { fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.5' },
  buyAdvice: {
    background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
    borderRadius: '10px', padding: '12px 16px',
    fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6',
    display: 'flex', gap: '8px', marginBottom: '1rem',
  },
  refreshBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline',
  },
};
