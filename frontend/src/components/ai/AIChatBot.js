import { useState, useRef, useEffect } from 'react';
 
const GEM = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
 
// Smart fallback responses when API quota exceeded
const FALLBACK = {
  keywords: [
    ['laptop','macbook','computer'],
    ['phone','mobile','samsung','iphone'],
    ['headphone','earphone','airpod','speaker'],
    ['shoe','sneaker','nike','adidas','boot'],
    ['jacket','hoodie','shirt','jeans','fashion'],
    ['book','novel','read'],
    ['yoga','fitness','sport','gym','exercise'],
    ['beauty','skincare','makeup','lipstick'],
    ['home','kitchen','vacuum','coffee'],
    ['deal','sale','discount','cheap','offer'],
    ['gift','present','recommend'],
    ['order','track','return','shipping','deliver'],
  ],
  replies: [
    "Great choice! We have amazing laptops including MacBook Air M3, ASUS ROG for gaming, and more. Check Electronics → Laptops! 💻",
    "Our phones section has Samsung Galaxy S25 Ultra and more flagship devices. All with great deals! 📱",
    "We carry Sony WH-1000XM5, Apple AirPods Pro, JBL speakers and more. Check Electronics → Audio! 🎧",
    "Our Fashion section has Nike Air Max, Adidas Ultraboost, Hoka and more top brands! 👟",
    "Check our Fashion section for The North Face, Supreme, Levi's and more top brands! 👗",
    "Our Books section has bestsellers like Atomic Habits, The Alchemist, Clean Code and more! 📚",
    "We have Manduka yoga mats, TRX trainers, Garmin watches and more in Sports! 💪",
    "Check Beauty section — Dyson Airwrap, Charlotte Tilbury, Fenty Beauty and more! ✨",
    "Our Home section has Dyson vacuum, Instant Pot, Nespresso, Philips Hue and more! 🏠",
    "Yes! We have great deals across all categories. Use filters to sort by price: low to high! 🔥",
    "I'd recommend checking our Featured Products section for top picks across all categories! 🎁",
    "You can track your order in the Orders section after logging in. Free shipping on orders over $50! 📦",
  ],
  default: "I can help you find products! We have Electronics, Fashion, Home, Sports, Books and Beauty. What are you looking for? 🛍️"
};
 
function getFallbackReply(text) {
  const lower = text.toLowerCase();
  for (let i = 0; i < FALLBACK.keywords.length; i++) {
    if (FALLBACK.keywords[i].some(k => lower.includes(k))) {
      return FALLBACK.replies[i];
    }
  }
  return FALLBACK.default;
}
 
async function askGemini(msgs) {
  const key = process.env.REACT_APP_GEMINI_API_KEY;
  if (!key || key === 'AIza_your_key_here') throw new Error('NO_KEY');
 
  const contents = msgs.slice(1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
 
  // Add system context to first user message
  if (contents.length > 0 && contents[0].role === 'user') {
    contents[0].parts[0].text =
      `You are a helpful shopping assistant for NexusShop e-commerce store. Be friendly and concise. ${contents[0].parts[0].text}`;
  }
 
  const res = await fetch(`${GEM}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });
 
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'API_ERROR');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}
 
export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{
    role: 'assistant',
    content: "Hi! 👋 I'm your AI shopping assistant. Ask me anything about products, deals, or recommendations!"
  }]);
  const [inp, setInp] = useState('');
  const [load, setLoad] = useState(false);
  const [mode, setMode] = useState('ai'); // 'ai' or 'fallback'
  const bot = useRef(null);
 
  useEffect(() => {
    if (open) bot.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);
 
  const send = async () => {
    if (!inp.trim() || load) return;
    const userMsg = { role: 'user', content: inp.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInp('');
    setLoad(true);
 
    let reply = '';
    try {
      if (mode === 'fallback') throw new Error('FALLBACK_MODE');
      const res = await askGemini(newMsgs);
      reply = res || getFallbackReply(userMsg.content);
    } catch (err) {
      // Switch to smart fallback on quota/key errors
      if (err.message.includes('quota') || err.message.includes('QUOTA') ||
          err.message.includes('429') || err.message.includes('NO_KEY') ||
          err.message === 'FALLBACK_MODE') {
        if (mode !== 'fallback') setMode('fallback');
        reply = getFallbackReply(userMsg.content);
      } else {
        reply = getFallbackReply(userMsg.content);
      }
    } finally {
      setLoad(false);
    }
 
    setMsgs(prev => [...prev, { role: 'assistant', content: reply }]);
  };
 
  const QR = ['Best deals today', 'Recommend a laptop', 'Gifts under $50', 'Track my order'];
 
  return (
    <>
      <button style={{ ...S.fab, ...(open ? S.fabO : {}) }} onClick={() => setOpen(!open)}>
        {open
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          : <span style={{ fontSize: '1.3rem' }}>✨</span>}
        {!open && <span style={S.pulse} />}
      </button>
 
      {open && (
        <div style={S.win}>
          <div style={S.winH}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={S.winAva}>AI</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.88rem' }}>AI Assistant</div>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
                  Online · {mode === 'fallback' ? 'Smart Mode' : 'Gemini'}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>×</button>
          </div>
 
          <div style={S.msgs}>
            {msgs.map((m, i) => (
              <div key={i} style={{ ...S.msgR, ...(m.role === 'user' ? S.msgRU : {}) }}>
                {m.role === 'assistant' && <div style={S.msgAva}>✨</div>}
                <div style={{ ...S.bub, ...(m.role === 'user' ? S.bubU : S.bubA) }}>{m.content}</div>
              </div>
            ))}
            {load && (
              <div style={S.msgR}>
                <div style={S.msgAva}>✨</div>
                <div style={{ ...S.bub, ...S.bubA }}>
                  <div style={{ display: 'flex', gap: '4px', padding: '2px 0' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text2)', display: 'inline-block', animation: `bounce .9s ease ${i * .15}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bot} />
          </div>
 
          {msgs.length <= 1 && (
            <div style={S.qr}>
              {QR.map(q => (
                <button key={q} onClick={() => setInp(q)} style={S.qrBtn}>{q}</button>
              ))}
            </div>
          )}
 
          <div style={S.inp}>
            <input
              value={inp}
              onChange={e => setInp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask me anything…"
              style={S.inpF}
              disabled={load}
            />
            <button onClick={send} disabled={load || !inp.trim()} style={{ ...S.sendBtn, opacity: load || !inp.trim() ? .5 : 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes pulse-r{0%{transform:scale(.8);opacity:1}100%{transform:scale(2.2);opacity:0}}
      `}</style>
    </>
  );
}
 
const S = {
  fab: { position: 'fixed', bottom: '22px', right: '22px', zIndex: 1000, width: '52px', height: '52px', borderRadius: '50%', background: 'var(--grad)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px var(--pglow)', transition: 'var(--t)', color: '#fff' },
  fabO: { background: 'var(--card2)', boxShadow: 'var(--shadow2)' },
  pulse: { position: 'absolute', inset: '-4px', borderRadius: '50%', background: 'var(--grad)', opacity: .35, animation: 'pulse-r 1.8s ease infinite', zIndex: -1 },
  win: { position: 'fixed', bottom: '84px', right: '22px', zIndex: 999, width: '340px', maxHeight: '500px', background: 'var(--card)', borderRadius: 'var(--r3)', boxShadow: '0 24px 64px rgba(0,0,0,.6)', border: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  winH: { padding: '14px 18px', background: 'linear-gradient(135deg,#0E0E1C,#18183A)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  winAva: { width: '34px', height: '34px', borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: '#fff' },
  msgs: { flex: 1, overflow: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '270px' },
  msgR: { display: 'flex', gap: '7px', alignItems: 'flex-end' },
  msgRU: { flexDirection: 'row-reverse' },
  msgAva: { width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem' },
  bub: { maxWidth: '78%', padding: '9px 13px', borderRadius: '13px', fontSize: '.83rem', lineHeight: '1.5' },
  bubA: { background: 'var(--card2)', color: 'var(--text)', borderBottomLeftRadius: '3px' },
  bubU: { background: 'var(--grad)', color: '#fff', borderBottomRightRadius: '3px' },
  qr: { padding: '7px 14px', display: 'flex', gap: '5px', flexWrap: 'wrap', borderTop: '1px solid var(--border)' },
  qrBtn: { background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 10px', fontSize: '.74rem', cursor: 'pointer', color: 'var(--text2)', transition: 'var(--t)' },
  inp: { padding: '11px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '7px', alignItems: 'center' },
  inpF: { flex: 1, border: '1.5px solid var(--border)', borderRadius: '9px', padding: '8px 12px', fontSize: '.85rem', outline: 'none', background: 'var(--bg2)', color: 'var(--text)' },
  sendBtn: { width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0, background: 'var(--grad)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--t)' },
};