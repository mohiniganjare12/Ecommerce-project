import{useEffect,useState}from'react';
import{useSearchParams}from'react-router-dom';
import api from'../utils/api';
import ProductCard from'../components/product/ProductCard';
 
const GEM=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
const CAT_ICONS={Electronics:'💻',Fashion:'👗',Home:'🏠',Sports:'⚽',Books:'📚',Beauty:'✨'};
const SORTS=[['newest','✨ Newest'],['price-asc','💰 Low → High'],['price-desc','💎 High → Low'],['popular','🔥 Popular'],['rating','⭐ Top Rated']];
 
export default function Products(){
  const[prods,setProds]=useState([]);
  const[cats,setCats]=useState([]);
  const[total,setTotal]=useState(0);
  const[pages,setPages]=useState(1);
  const[loading,setLoading]=useState(false);
  const[params,setParams]=useSearchParams();
  const[aiQ,setAiQ]=useState('');
  const[aiLoad,setAiLoad]=useState(false);
  const[sugg,setSugg]=useState([]);
  const[tip,setTip]=useState('');
  const[sidebar,setSidebar]=useState(true);
 
  const page=Number(params.get('page')||1);
  const search=params.get('search')||'';
  const cat=params.get('category')||'';
  const sort=params.get('sort')||'newest';
  const min=params.get('minPrice')||'';
  const max=params.get('maxPrice')||'';
 
  useEffect(()=>{
    api.get('/products/categories').then(r=>setCats(r.data)).catch(()=>{});
  },[]);
 
  useEffect(()=>{
    setLoading(true);
    const q={page,limit:12,sort};
    if(search)q.search=search;
    if(cat)q.category=cat;
    if(min)q.minPrice=min;
    if(max)q.maxPrice=max;
    api.get('/products',{params:q})
      .then(r=>{setProds(r.data.products||[]);setTotal(r.data.total||0);setPages(r.data.pages||1);})
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[page,search,cat,sort,min,max]);
 
  // setFilter - resets page to 1 (for filters/search changes)
  const setFilter=(k,v)=>{
    const p=new URLSearchParams(params);
    if(v)p.set(k,v);else p.delete(k);
    p.set('page','1'); // reset to page 1 when filter changes
    setParams(p);
  };
 
  // goToPage - ONLY changes the page number, keeps all other params
  const goToPage=(n)=>{
    const p=new URLSearchParams(params);
    p.set('page',String(n));
    setParams(p);
  };
 
  const clear=()=>setParams({sort:'newest'});
  const hasF=cat||min||max||search;
 
  const aiSearch=async()=>{
    if(!aiQ.trim())return;
    setAiLoad(true);setSugg([]);setTip('');
    try{
      const key=process.env.REACT_APP_GEMINI_API_KEY;
      const res=await fetch(`${GEM}?key=${key}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          contents:[{parts:[{text:`You are a shopping assistant. User wants: "${aiQ}". Return ONLY valid JSON, no markdown, no backticks: {"mainSearch":"keyword","suggestions":["a","b","c"],"tip":"one tip"}`}]}]
        })
      });
      const data=await res.json();
      const txt=data.candidates?.[0]?.content?.parts?.[0]?.text||'{}';
      const parsed=JSON.parse(txt.replace(/```json|```/g,'').trim());
      setSugg(parsed.suggestions||[]);
      if(parsed.tip)setTip(parsed.tip);
      if(parsed.mainSearch)setFilter('search',parsed.mainSearch);
    }catch{
      setFilter('search',aiQ);
    }finally{setAiLoad(false);}
  };
 
  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',paddingBottom:'5rem'}}>
      {/* Header */}
      <div style={S.hdr}>
        <div style={S.hdrGrid}/>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <h1 style={S.hTitle}>{cat||(search?`"${search}"`:'All Products')}</h1>
          <p style={{color:'var(--text2)',marginTop:'4px',fontSize:'.88rem'}}>{total} product{total!==1?'s':''} found</p>
          {/* AI Bar */}
          <div style={S.aiRow}>
            <div style={S.aiBox}>
              <span style={{fontSize:'1.1rem'}}>🤖</span>
              <input
                value={aiQ}
                onChange={e=>setAiQ(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&aiSearch()}
                placeholder="Describe what you're looking for… AI will find it"
                style={{flex:1,background:'none',border:'none',outline:'none',color:'var(--text)',fontSize:'.9rem'}}
              />
              {aiLoad&&<span style={{width:'15px',height:'15px',border:'2px solid rgba(124,111,255,.3)',borderTopColor:'var(--p)',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite',flexShrink:0}}/>}
            </div>
            <button onClick={aiSearch} disabled={aiLoad||!aiQ.trim()} style={S.aiBtnS}>
              {aiLoad?'Searching…':'✨ AI Search'}
            </button>
          </div>
          {sugg.length>0&&(
            <div style={{display:'flex',gap:'7px',flexWrap:'wrap',marginTop:'9px',alignItems:'center'}}>
              <span style={{fontSize:'.74rem',color:'var(--text2)'}}>Try:</span>
              {sugg.map(s=>(
                <button key={s} onClick={()=>{setFilter('search',s);setSugg([]);}}
                  style={{background:'rgba(124,111,255,.1)',border:'1px solid rgba(124,111,255,.28)',color:'var(--p2)',padding:'4px 11px',borderRadius:'20px',fontSize:'.75rem',cursor:'pointer',fontWeight:600}}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {tip&&<div style={{marginTop:'8px',background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.18)',borderRadius:'8px',padding:'8px 13px',fontSize:'.8rem',color:'var(--gold)'}}>💡 {tip}</div>}
        </div>
      </div>
 
      <div className="container" style={{display:'flex',gap:'1.8rem',marginTop:'2rem'}}>
        {/* Sidebar */}
        {sidebar&&(
          <aside style={S.sb}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.4rem'}}>
              <span style={{fontFamily:'var(--display)',fontWeight:700,fontSize:'.95rem'}}>Filters</span>
              {hasF&&<button onClick={clear} style={{background:'none',border:'none',color:'var(--pink)',fontSize:'.78rem',fontWeight:600,cursor:'pointer'}}>Clear all</button>}
            </div>
            {/* Category */}
            <div style={S.fSec}>
              <div style={S.fLabel}>Category</div>
              <button onClick={()=>setFilter('category','')} style={{...S.fBtn,...(cat===''?S.fBtnA:{})}}>All</button>
              {cats.map(c=>(
                <button key={c} onClick={()=>setFilter('category',c)} style={{...S.fBtn,...(cat===c?S.fBtnA:{})}}>
                  <span>{CAT_ICONS[c]||'📦'}</span>{c}
                </button>
              ))}
            </div>
            {/* Price */}
            <div style={S.fSec}>
              <div style={S.fLabel}>Price ($)</div>
              <div style={{display:'flex',gap:'7px'}}>
                <input type="number" placeholder="Min" value={min} onChange={e=>setFilter('minPrice',e.target.value)} style={S.pInp}/>
                <input type="number" placeholder="Max" value={max} onChange={e=>setFilter('maxPrice',e.target.value)} style={S.pInp}/>
              </div>
            </div>
            {/* Sort */}
            <div style={S.fSec}>
              <div style={S.fLabel}>Sort By</div>
              {SORTS.map(([v,l])=>(
                <button key={v} onClick={()=>setFilter('sort',v)} style={{...S.fBtn,...(sort===v?S.fBtnA:{})}}>{l}</button>
              ))}
            </div>
          </aside>
        )}
 
        {/* Products Grid */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem',flexWrap:'wrap',gap:'8px'}}>
            <div style={{display:'flex',gap:'7px',flexWrap:'wrap',alignItems:'center'}}>
              <button onClick={()=>setSidebar(!sidebar)} style={S.fToggle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                {sidebar?'Hide':'Show'} Filters
                {hasF&&<span style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--p)',display:'inline-block'}}/>}
              </button>
              {cat&&<Chip l={cat} r={()=>setFilter('category','')}/>}
              {search&&<Chip l={`"${search}"`} r={()=>setFilter('search','')}/>}
              {(min||max)&&<Chip l={`$${min||0}–$${max||'∞'}`} r={()=>{setFilter('minPrice','');setFilter('maxPrice','');}}/>}
            </div>
            <span style={{fontSize:'.8rem',color:'var(--text2)'}}>{total} results</span>
          </div>
 
          {loading?(
            <div style={S.grid}>
              {Array.from({length:8}).map((_,i)=>(
                <div key={i} style={{borderRadius:'var(--r2)',overflow:'hidden',border:'1px solid var(--border)'}}>
                  <div className="skeleton" style={{height:'225px'}}/>
                  <div style={{padding:'13px',display:'flex',flexDirection:'column',gap:'7px'}}>
                    {[58,82,42].map(w=><div key={w} className="skeleton" style={{height:'10px',width:`${w}%`}}/>)}
                  </div>
                </div>
              ))}
            </div>
          ):prods.length===0?(
            <div style={{textAlign:'center',padding:'6rem 2rem'}}>
              <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>🔍</div>
              <h3 style={{fontFamily:'var(--display)',fontSize:'1.3rem',marginBottom:'7px'}}>Nothing found</h3>
              <p style={{color:'var(--text2)',marginBottom:'1.5rem'}}>Try different keywords or clear your filters</p>
              <button onClick={clear} style={{background:'var(--grad)',color:'#fff',border:'none',borderRadius:'10px',padding:'11px 24px',fontWeight:700,cursor:'pointer'}}>Clear Filters</button>
            </div>
          ):(
            <div style={S.grid}>
              {prods.map((p,i)=>(
                <div key={p._id} style={{animation:`fadeUp .35s ease ${(i%12)*.042}s both`}}>
                  <ProductCard product={p}/>
                </div>
              ))}
            </div>
          )}
 
          {/* ── PAGINATION ── */}
          {pages>1&&(
            <div style={{display:'flex',gap:'6px',justifyContent:'center',marginTop:'3rem',flexWrap:'wrap',alignItems:'center'}}>
              {/* Prev */}
              <button
                disabled={page===1}
                onClick={()=>goToPage(page-1)}
                style={{...S.pBtn,opacity:page===1?.35:1,cursor:page===1?'not-allowed':'pointer'}}
              >← Prev</button>
 
              {/* Page numbers */}
              {Array.from({length:pages},(_,i)=>i+1).map(n=>(
                <button
                  key={n}
                  onClick={()=>goToPage(n)}
                  style={{...S.pBtn,...(n===page?S.pBtnA:{})}}
                >{n}</button>
              ))}
 
              {/* Next */}
              <button
                disabled={page===pages}
                onClick={()=>goToPage(page+1)}
                style={{...S.pBtn,opacity:page===pages?.35:1,cursor:page===pages?'not-allowed':'pointer'}}
              >Next →</button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
 
function Chip({l,r}){
  return(
    <div style={{display:'inline-flex',alignItems:'center',gap:'5px',background:'rgba(124,111,255,.1)',border:'1px solid rgba(124,111,255,.27)',color:'var(--p2)',padding:'3px 9px',borderRadius:'20px',fontSize:'.72rem',fontWeight:600}}>
      {l}
      <button onClick={r} style={{background:'none',border:'none',color:'var(--p)',cursor:'pointer',fontSize:'.85rem',padding:0,lineHeight:1}}>×</button>
    </div>
  );
}
 
const S={
  hdr:{background:'linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%)',padding:'3rem 0 2rem',position:'relative',borderBottom:'1px solid var(--border)',overflow:'hidden'},
  hdrGrid:{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(124,111,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,111,255,.04) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'},
  hTitle:{fontFamily:'var(--display)',fontSize:'clamp(1.4rem,4vw,2.4rem)',fontWeight:700},
  aiRow:{display:'flex',gap:'9px',marginTop:'1.4rem',flexWrap:'wrap'},
  aiBox:{flex:1,minWidth:'250px',display:'flex',alignItems:'center',gap:'9px',background:'var(--card)',border:'1.5px solid var(--border2)',borderRadius:'11px',padding:'11px 14px'},
  aiBtnS:{background:'var(--grad)',color:'#fff',border:'none',borderRadius:'11px',padding:'11px 20px',fontWeight:700,fontSize:'.85rem',cursor:'pointer',whiteSpace:'nowrap',boxShadow:'0 4px 14px var(--pglow)'},
  sb:{width:'228px',flexShrink:0},
  fSec:{marginBottom:'1.4rem',paddingBottom:'1.4rem',borderBottom:'1px solid var(--border)'},
  fLabel:{fontSize:'.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.09em',color:'var(--text2)',marginBottom:'9px'},
  fBtn:{display:'flex',alignItems:'center',gap:'7px',width:'100%',background:'none',border:'none',padding:'7px 9px',borderRadius:'7px',fontSize:'.84rem',color:'var(--text2)',cursor:'pointer',textAlign:'left',transition:'var(--t)',marginBottom:'2px'},
  fBtnA:{background:'rgba(124,111,255,.1)',color:'var(--p2)',fontWeight:600,border:'1px solid rgba(124,111,255,.2)'},
  pInp:{flex:1,background:'var(--card)',border:'1.5px solid var(--border)',borderRadius:'7px',padding:'8px 9px',fontSize:'.82rem',color:'var(--text)',outline:'none'},
  fToggle:{display:'inline-flex',alignItems:'center',gap:'6px',background:'var(--card)',border:'1px solid var(--border2)',borderRadius:'9px',padding:'8px 14px',fontSize:'.82rem',fontWeight:600,color:'var(--text2)',cursor:'pointer'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(218px,1fr))',gap:'1.1rem'},
  pBtn:{padding:'9px 16px',borderRadius:'9px',border:'1px solid var(--border)',background:'var(--card)',color:'var(--text2)',fontSize:'.84rem',fontWeight:600,cursor:'pointer',transition:'var(--t)',minWidth:'44px',textAlign:'center'},
  pBtnA:{background:'var(--grad)',color:'#fff',border:'none',boxShadow:'0 4px 12px var(--pglow)'},
};