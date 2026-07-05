import { useState } from 'react';
import api from '../../utils/api';

export default function AISearchBar({ onSearch, initialQuery = '' }) {
  const [query, setQuery]               = useState(initialQuery);
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiHint, setAiHint]             = useState('');
  const [open, setOpen]                 = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { onSearch(query.trim()); setOpen(false); }
  };

  const handleAISearch = async () => {
    if (!query.trim()) return;
    setAiLoading(true);
    setAiHint('');
    setAiSuggestions([]);
    try {
      // Call your own backend AI route — keeps API key safe on server
      const { data } = await api.post('/products/ai-search', { query: query.trim() });
      setAiSuggestions(data.suggestions || []);
      if (data.hint) setAiHint(data.hint);
      if (data.mainSearch) {
        onSearch(data.mainSearch);
        setQuery(data.mainSearch);
      }
      setOpen(true);
    } catch {
      // Fallback to regular search if AI fails
      setAiHint('AI search unavailable. Showing regular results.');
      onSearch(query.trim());
      setOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSearch} style={styles.form}>
        <div style={styles.inputWrap}>
          <svg style={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(false); }}
            placeholder="Search products... or describe what you need"
            style={styles.input}
            onFocus={() => aiSuggestions.length > 0 && setOpen(true)}
          />
          {query && (
            <button type="button"
              onClick={() => { setQuery(''); setAiSuggestions([]); setAiHint(''); onSearch(''); }}
              style={styles.clearBtn}>×</button>
          )}
        </div>

        <button type="submit" style={styles.searchBtn}>Search</button>

        <button
          type="button"
          onClick={handleAISearch}
          disabled={aiLoading || !query.trim()}
          style={{ ...styles.aiBtn, ...(aiLoading ? styles.aiBtnLoading : {}) }}
          title="AI-powered smart search"
        >
          {aiLoading
            ? <span style={styles.spinner} />
            : <><span>✨</span><span style={{ fontSize: '0.82rem', fontWeight: '600' }}>AI Search</span></>}
        </button>
      </form>

      {/* AI suggestions dropdown */}
      {open && aiSuggestions.length > 0 && (
        <div style={styles.dropdown}>
          {aiHint && (
            <div style={styles.hint}>
              <span style={{ marginRight: '6px' }}>💡</span>{aiHint}
            </div>
          )}
          <p style={styles.dropdownLabel}>Related searches:</p>
          <div style={styles.suggestions}>
            {aiSuggestions.map(s => (
              <button key={s} style={styles.suggestion}
                onClick={() => { onSearch(s); setQuery(s); setOpen(false); }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {!open && aiHint && !aiSuggestions.length && (
        <div style={styles.hintBar}>💡 {aiHint}</div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { position: 'relative', marginBottom: '1.5rem' },
  form: { display: 'flex', gap: '8px', alignItems: 'center' },
  inputWrap: {
    flex: 1, display: 'flex', alignItems: 'center',
    background: 'var(--bg-card)', border: '1.5px solid var(--border)',
    borderRadius: '12px', padding: '0 16px', gap: '10px',
    transition: 'var(--transition)',
  },
  searchIcon: { color: 'var(--text-muted)', flexShrink: 0 },
  input: {
    flex: 1, border: 'none', outline: 'none', background: 'none',
    padding: '12px 0', fontSize: '0.95rem', color: 'var(--text-primary)',
  },
  clearBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', fontSize: '1.2rem', padding: '0 4px',
    display: 'flex', alignItems: 'center',
  },
  searchBtn: {
    padding: '12px 20px', background: 'var(--text-primary)', color: '#fff',
    border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.88rem',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'var(--transition)',
  },
  aiBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '12px 18px', borderRadius: '10px', whiteSpace: 'nowrap',
    background: 'linear-gradient(135deg, #7C3AED, #DC2626)',
    color: '#fff', border: 'none', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.88rem', transition: 'var(--transition)',
  },
  aiBtnLoading: { opacity: 0.7 },
  spinner: {
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.6s linear infinite',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 100,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', padding: '16px',
  },
  hint: {
    background: 'rgba(217,119,6,0.08)', color: 'var(--gold)',
    padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem',
    marginBottom: '12px', border: '1px solid rgba(217,119,6,0.2)',
  },
  dropdownLabel: { fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' },
  suggestions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  suggestion: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '6px 14px', fontSize: '0.84rem',
    color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500',
    transition: 'var(--transition)',
  },
  hintBar: {
    marginTop: '8px', padding: '10px 14px',
    background: 'rgba(217,119,6,0.06)', color: 'var(--gold)',
    borderRadius: '8px', fontSize: '0.84rem', border: '1px solid rgba(217,119,6,0.15)',
  },
};