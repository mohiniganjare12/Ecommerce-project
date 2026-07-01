import{useEffect,useState,useRef}from'react';
import{Link}from'react-router-dom';
import api from'../utils/api';
import ProductCard from'../components/product/ProductCard';

function useInView(ref){
  const[v,setV]=useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold:.1});
    if(ref.current)o.observe(ref.current);
    return()=>o.disconnect();
  },[ref]);
  return v;
}

function Counter({end,suffix='',dur=1800}){
  const[n,setN]=useState(0);const ref=useRef(null);const v=useInView(ref);
  useEffect(()=>{
    if(!v)return;
    let s=0;const step=16;const inc=end/(dur/step);
    const t=setInterval(()=>{s+=inc;if(s>=end){setN(end);clearInterval(t);}else setN(Math.floor(s));},step);
    return()=>clearInterval(t);
  },[v,end,dur]);
  return<span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

const CATS=[
  {name:'Electronics',icon:'💻',col:'#7C6FFF',bg:'rgba(124,111,255,.1)'},
  {name:'Fashion',    icon:'👗',col:'#FF6B9D',bg:'rgba(255,107,157,.1)'},
  {name:'Home',       icon:'🏠',col:'#22D3EE',bg:'rgba(34,211,238,.1)'},
  {name:'Sports',     icon:'⚽',col:'#34D399',bg:'rgba(52,211,153,.1)'},
  {name:'Books',      icon:'📚',col:'#FBBF24',bg:'rgba(251,191,36,.1)'},
  {name:'Beauty',     icon:'✨',col:'#F87171',bg:'rgba(248,113,113,.1)'},
];

const SLIDES=[
  {pill:'New Season 2026 🔥',h1:'Discover',h2:'Future Shopping',sub:'AI-powered discovery. Premium products. Delivered fast.',grad:'linear-gradient(135deg,#7C6FFF,#FF6B9D)',emoji:'🛍️'},
  {pill:'AI Powered ✨',h1:'Smart',h2:'Search & Find',sub:'Describe what you need — our AI finds it in seconds.',grad:'linear-gradient(135deg,#22D3EE,#7C6FFF)',emoji:'🤖'},
  {pill:'Top Deals Today 💎',h1:'Premium',h2:'Quality Brands',sub:'Curated products from the world\'s best brands.',grad:'linear-gradient(135deg,#FBBF24,#FF6B9D)',emoji:'💎'},
];

export default function Home(){
  const[feat,setFeat]=useState([]);
  const[loading,setLoading]=useState(true);
  const[slide,setSlide]=useState(0);
  const[tab,setTab]=useState('featured');
  const[allProds,setAllProds]=useState([]);

  useEffect(()=>{
    const t=setInterval(()=>setSlide(i=>(i+1)%SLIDES.length),4500);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    Promise.all([
      api.get('/products/featured').catch(()=>({data:[]})),
      api.get('/products?sort=newest&limit=8').catch(()=>({data:{products:[]}})),
    ]).then(([f,a])=>{
      setFeat(f.data||[]);
      setAllProds(a.data?.products||[]);
    }).finally(()=>setLoading(false));
  },[]);

  const display=tab==='featured'?feat:allProds;

  return(
    <div style={{background:'var(--bg)'}}>

      {/* ─── HERO ─── */}
      <section style={S.hero}>
        <div style={S.hBlob1}/>
        <div style={S.hBlob2}/>
        <div style={S.hBlob3}/>
        <div style={S.hGrid}/>
        <div className="container" style={S.hInner}>
          <div style={S.hLeft}>
            <div style={{...S.hPill,animation:'fadeUp .5s ease'}} key={slide+'p'}>
              <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--green)',display:'inline-block',boxShadow:'0 0 8px var(--green)'}}/>
              {SLIDES[slide].pill}
            </div>
            <h1 style={{...S.hTitle,animation:'fadeUp .5s ease .08s both'}} key={slide+'t'}>
              {SLIDES[slide].h1}<br/>
              <span style={{background:SLIDES[slide].grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                {SLIDES[slide].h2}
              </span>
            </h1>
            <p style={{...S.hSub,animation:'fadeUp .5s ease .15s both'}} key={slide+'s'}>{SLIDES[slide].sub}</p>
            <div style={{display:'flex',gap:'12px',flexWrap:'wrap',animation:'fadeUp .5s ease .22s both'}}>
              <Link to="/products" className="btn btn-primary" style={{padding:'13px 26px',fontSize:'.92rem'}}>
                Shop Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/products?sort=popular" className="btn btn-outline" style={{padding:'13px 26px',fontSize:'.92rem'}}>Explore Deals</Link>
            </div>
            <div style={S.hStats}>
              {[['50K+','Customers'],['10K+','Products'],['4.9★','Rating']].map(([n,l])=>(
                <div key={l} style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                  <span style={{fontFamily:'var(--display)',fontSize:'1.3rem',fontWeight:700}}>{n}</span>
                  <span style={{fontSize:'.75rem',color:'var(--text2)'}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={S.hRight}>
            <div style={{...S.hOrb,background:SLIDES[slide].grad,animation:'float 4s ease-in-out infinite',transition:'background 1s ease'}}>
              <span style={{fontSize:'4.5rem'}}>{SLIDES[slide].emoji}</span>
            </div>
            {[
              {top:'8%',right:'-16px',icon:'🔥',t:'Hot Deals',s:'Up to 60% off',d:'1s'},
              {bottom:'18%',left:'-16px',icon:'✨',t:'AI Search',s:'Find anything',d:'1.8s'},
              {bottom:'44%',right:'-20px',icon:'🚚',t:'Free Ship',s:'On $50+',d:'2.5s'},
            ].map(({icon,t,s,d,...pos})=>(
              <div key={t} style={{...S.fCard,...pos,animation:`float 3.5s ease-in-out ${d} infinite`}}>
                <span style={{fontSize:'1.1rem'}}>{icon}</span>
                <div><div style={{fontWeight:700,fontSize:'.82rem'}}>{t}</div><div style={{fontSize:'.7rem',color:'var(--text2)'}}>{s}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.dots}>
          {SLIDES.map((_,i)=>(
            <button key={i} onClick={()=>setSlide(i)} style={{...S.dot,...(i===slide?S.dotA:{})}}/>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section style={S.sec}>
        <div className="container">
          <div style={S.secHead}>
            <div><p style={S.eyebrow}>Browse by</p><h2 style={S.secTitle}>Categories</h2></div>
            <Link to="/products" style={S.seeAll}>View all →</Link>
          </div>
          <div style={S.catGrid}>
            {CATS.map((c,i)=>(
              <Link key={c.name} to={`/products?category=${c.name}`} style={{...S.catCard,animationDelay:`${i*.07}s`}} className="fade-up">
                <div style={{...S.catIcon,background:c.bg,color:c.col}}>{c.icon}</div>
                <span style={{fontWeight:600,fontSize:'.86rem'}}>{c.name}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{marginLeft:'auto'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS ─── */}
      <section style={{...S.sec,background:'var(--bg2)'}}>
        <div className="container">
          <div style={S.secHead}>
            <div><p style={S.eyebrow}>Hand-picked</p><h2 style={S.secTitle}>Top Products</h2></div>
            <div style={S.tabs}>
              {[['featured','🔥 Featured'],['new','✨ New']].map(([k,l])=>(
                <button key={k} onClick={()=>setTab(k)} style={{...S.tab,...(tab===k?S.tabA:{})}}>{l}</button>
              ))}
            </div>
          </div>
          {loading?(
            <div style={S.grid}>{Array.from({length:4}).map((_,i)=>(
              <div key={i} style={{borderRadius:'var(--r2)',overflow:'hidden',border:'1px solid var(--border)'}}>
                <div className="skeleton" style={{height:'225px'}}/>
                <div style={{padding:'13px',display:'flex',flexDirection:'column',gap:'7px'}}>
                  {[60,85,40].map(w=><div key={w} className="skeleton" style={{height:'10px',width:`${w}%`}}/>)}
                </div>
              </div>
            ))}</div>
          ):display.length===0?(
            <div style={{textAlign:'center',padding:'4rem',color:'var(--text2)'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🛍️</div>
              <p>No products yet — <Link to="/products" style={{color:'var(--p)'}}>browse all →</Link></p>
            </div>
          ):(
            <div style={S.grid}>
              {display.map((p,i)=>(
                <div key={p._id} style={{animation:`fadeUp .4s ease ${i*.06}s both`}}>
                  <ProductCard product={p}/>
                </div>
              ))}
            </div>
          )}
          <div style={{textAlign:'center',marginTop:'2.5rem'}}>
            <Link to="/products" className="btn btn-outline" style={{padding:'12px 30px'}}>View All Products →</Link>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={S.statsBand}>
        <div className="container">
          <div style={S.statsRow}>
            {[['50000','K+','Happy Customers','👥'],['10000','+','Products','📦'],['150','+','Brands','🏷️'],['99','%','Satisfaction','⭐']].map(([n,suf,l,ic])=>(
              <div key={l} style={S.statCard}>
                <div style={{fontSize:'1.8rem',marginBottom:'6px'}}>{ic}</div>
                <div style={S.statN}><Counter end={parseInt(n)} suffix={suf}/></div>
                <div style={{fontSize:'.82rem',color:'var(--text2)',marginTop:'3px'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI BANNER ─── */}
      <section style={S.aiBan}>
        <div className="container">
          <div style={S.aiInner}>
            <div>
              <div style={S.aiPill}>✨ AI-Powered Shopping</div>
              <h2 style={{fontFamily:'var(--display)',fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:700,marginTop:'10px',color:'#fff'}}>
                Meet your <span style={{background:'var(--grad)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>AI Shopping</span> Assistant
              </h2>
              <p style={{color:'rgba(255,255,255,.55)',marginTop:'9px',lineHeight:'1.7',maxWidth:'420px',fontSize:'.92rem'}}>
                Type anything in plain English — "wireless headphones under $100" or "gift for a gamer". Our AI finds it instantly. 24/7, always helpful.
              </p>
              <div style={{display:'flex',gap:'9px',marginTop:'1.2rem',flexWrap:'wrap'}}>
                {['AI Chat','Smart Search','Review Summary','Recommendations'].map(f=>(
                  <span key={f} style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.75)',padding:'5px 12px',borderRadius:'20px',fontSize:'.78rem',fontWeight:500}}>✓ {f}</span>
                ))}
              </div>
            </div>
            <Link to="/products" style={S.aiCta}>
              Try AI Search <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section style={{...S.sec,paddingBottom:'5rem'}}>
        <div className="container">
          <h2 style={{...S.secTitle,textAlign:'center',marginBottom:'2.5rem'}}>Why <span className="gtext">NexusShop</span>?</h2>
          <div style={S.whyGrid}>
            {[['🚚','Free Shipping','On all orders over $50. Lightning-fast delivery.','#7C6FFF'],
              ['🔒','Secure Payments','Bank-grade Stripe encryption on every transaction.','#34D399'],
              ['↩️','30-Day Returns','Full refund, no questions asked. We mean it.','#FF6B9D'],
              ['🤖','AI Assistant','Claude-powered 24/7 support to find anything you need.','#FBBF24']].map(([ic,t,d,col])=>(
              <div key={t} style={S.whyCard}>
                <div style={{...S.whyIcon,background:`${col}12`,color:col}}>{ic}</div>
                <h3 style={{fontFamily:'var(--display)',fontSize:'.95rem',fontWeight:700,marginBottom:'7px'}}>{t}</h3>
                <p style={{color:'var(--text2)',fontSize:'.82rem',lineHeight:'1.65'}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.8;transform:scale(1.05)}}
        .fade-up{animation:fadeUp .45s ease both}
      `}</style>
    </div>
  );
}

const S={
  hero:{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden',paddingTop:'68px'},
  hBlob1:{position:'absolute',width:'550px',height:'550px',borderRadius:'50%',background:'var(--grad)',filter:'blur(90px)',opacity:.12,top:'-80px',right:'-80px',animation:'pulse 6s ease-in-out infinite',pointerEvents:'none'},
  hBlob2:{position:'absolute',width:'380px',height:'380px',borderRadius:'50%',background:'var(--cyan)',filter:'blur(90px)',opacity:.08,bottom:'0',left:'-80px',animation:'pulse 8s ease-in-out 2s infinite',pointerEvents:'none'},
  hBlob3:{position:'absolute',width:'280px',height:'280px',borderRadius:'50%',background:'var(--pink)',filter:'blur(80px)',opacity:.07,top:'35%',left:'42%',animation:'pulse 7s ease-in-out 4s infinite',pointerEvents:'none'},
  hGrid:{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(124,111,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,111,255,.04) 1px,transparent 1px)',backgroundSize:'56px 56px',pointerEvents:'none'},
  hInner:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4rem',alignItems:'center',position:'relative',zIndex:2,width:'100%',padding:'5rem 1.5rem'},
  hLeft:{display:'flex',flexDirection:'column',gap:'1.4rem'},
  hPill:{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(52,211,153,.1)',border:'1px solid rgba(52,211,153,.22)',color:'var(--green)',padding:'5px 14px',borderRadius:'20px',fontSize:'.78rem',fontWeight:600,width:'fit-content'},
  hTitle:{fontFamily:'var(--display)',fontSize:'clamp(2.2rem,6vw,4.8rem)',fontWeight:800,lineHeight:'.98',letterSpacing:'-.03em'},
  hSub:{color:'var(--text2)',fontSize:'1rem',lineHeight:'1.75',maxWidth:'460px'},
  hStats:{display:'flex',gap:'2rem',paddingTop:'1rem',borderTop:'1px solid var(--border)'},
  hRight:{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',height:'440px'},
  hOrb:{width:'280px',height:'280px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 80px rgba(124,111,255,.3)'},
  fCard:{position:'absolute',display:'flex',alignItems:'center',gap:'9px',background:'rgba(19,19,31,.92)',backdropFilter:'blur(16px)',border:'1px solid var(--border2)',borderRadius:'11px',padding:'9px 14px',boxShadow:'var(--shadow)'},
  dots:{position:'absolute',bottom:'28px',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'7px',zIndex:3},
  dot:{width:'7px',height:'7px',borderRadius:'50%',background:'var(--border2)',border:'none',cursor:'pointer',transition:'var(--t)'},
  dotA:{background:'var(--p)',width:'22px',borderRadius:'4px'},
  sec:{padding:'5rem 0'},
  secHead:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'2.2rem'},
  eyebrow:{fontSize:'.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--p)',marginBottom:'3px'},
  secTitle:{fontFamily:'var(--display)',fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:700},
  seeAll:{fontSize:'.84rem',fontWeight:600,color:'var(--p)',transition:'var(--t)'},
  catGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:'10px'},
  catCard:{display:'flex',alignItems:'center',gap:'10px',padding:'14px',background:'var(--card)',borderRadius:'var(--r2)',border:'1px solid var(--border)',transition:'all .2s ease',cursor:'pointer'},
  catIcon:{width:'38px',height:'38px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.25rem',flexShrink:0},
  tabs:{display:'flex',gap:'3px',background:'var(--card)',borderRadius:'9px',padding:'3px',border:'1px solid var(--border)'},
  tab:{padding:'7px 15px',borderRadius:'7px',border:'none',background:'none',color:'var(--text2)',fontWeight:600,fontSize:'.8rem',cursor:'pointer',transition:'var(--t)'},
  tabA:{background:'var(--grad)',color:'#fff'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(235px,1fr))',gap:'1.2rem'},
  statsBand:{background:'var(--card)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'3rem 0'},
  statsRow:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1.5rem'},
  statCard:{textAlign:'center',padding:'1rem'},
  statN:{fontFamily:'var(--display)',fontSize:'1.9rem',fontWeight:700,background:'var(--grad)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'},
  aiBan:{background:'linear-gradient(135deg,#0A0A18,#140820)',padding:'5rem 0',borderTop:'1px solid rgba(124,111,255,.18)',borderBottom:'1px solid rgba(124,111,255,.18)'},
  aiInner:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'3rem',flexWrap:'wrap'},
  aiPill:{display:'inline-flex',gap:'6px',background:'rgba(124,111,255,.13)',color:'var(--p2)',padding:'5px 13px',borderRadius:'20px',fontSize:'.76rem',fontWeight:700,border:'1px solid rgba(124,111,255,.28)'},
  aiCta:{display:'inline-flex',alignItems:'center',gap:'8px',background:'var(--grad)',color:'#fff',padding:'13px 26px',borderRadius:'11px',fontWeight:700,fontSize:'.9rem',flexShrink:0,boxShadow:'0 8px 28px var(--pglow)'},
  whyGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:'1.2rem'},
  whyCard:{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r2)',padding:'1.6rem',transition:'var(--t)'},
  whyIcon:{width:'46px',height:'46px',borderRadius:'11px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',marginBottom:'.9rem'},
};
