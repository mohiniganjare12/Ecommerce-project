import{useEffect,useState}from'react';
import{useSearchParams}from'react-router-dom';
import api from'../utils/api';
import ProductCard from'../components/product/ProductCard';
import useWindowSize from'../hooks/useWindowSize';

const GEM=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
const CAT_ICONS={Electronics:'💻',Fashion:'👗',Home:'🏠',Sports:'⚽',Books:'📚',Beauty:'✨',Health:'💊',Toys:'🧸',Pets:'🐾',Tools:'🔧',Office:'💼',Travel:'✈️'};
const SORTS=[['newest','✨ Newest'],['price-asc','💰 Low → High'],['price-desc','💎 High → Low'],['popular','🔥 Popular'],['rating','⭐ Top Rated']];

export default function Products(){
  const{isMobile}=useWindowSize();
  const[prods,setProds]=useState([]);
  const[cats,setCats]=useState([]);
  const[total,setTotal]=useState(0);
  const[pages,setPages]=useState(1);
  const[loading,setLoading]=useState(false);
  const[params,setParams]=useSearchParams();
  const[searchInput,setSearchInput]=useState('');
  const[aiLoad,setAiLoad]=useState(false);
  const[sugg,setSugg]=useState([]);
  const[tip,setTip]=useState('');
  const[sidebar,setSidebar]=useState(!isMobile);

  const page=Number(params.get('page')||1);
  const search=params.get('search')||'';
  const cat=params.get('category')||'';
  const sort=params.get('sort')||'newest';
  const min=params.get('minPrice')||'';
  const max=params.get('maxPrice')||'';

  useEffect(()=>{ setSearchInput(search); },[search]);

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

  const setFilter=(k,v)=>{
    const p=new URLSearchParams(params);
    if(v)p.set(k,v);else p.delete(k);
    p.set('page','1');
    setParams(p);
  };

  const goToPage=(n)=>{
    const p=new URLSearchParams(params);
    p.set('page',String(n));
    setParams(p);
  };

  const clear=()=>{ setSearchInput(''); setParams({sort:'newest'}); setSugg([]); setTip(''); };
  const hasF=cat||min||max||search;

  // Auto-search after user stops typing (500ms debounce)
  useEffect(()=>{
    const timer=setTimeout(()=>{
      if(searchInput.trim()!==search){
        const p=new URLSearchParams(params);
        if(searchInput.trim()){
          p.set('search',searchInput.trim());
          p.delete('category');
        } else {
          p.delete('search');
        }
        p.set('page','1');
        setParams(p);
      }
    },500);
    return()=>clearTimeout(timer);
  },[searchInput]);

  const doSearch=()=>{
    const p=new URLSearchParams(params);
    if(searchInput.trim()){
      p.set('search',searchInput.trim());
      p.delete('category'); // clear category when searching
    } else {
      p.delete('search');
    }
    p.set('page','1');
    setParams(p);
  };

  const aiSearch=async()=>{
    if(!searchInput.trim())return;
    setAiLoad(true);setSugg([]);setTip('');
    try{
      const key=process.env.REACT_APP_GEMINI_API_KEY;
      if(!key) throw new Error('No key');
      const res=await fetch(`${GEM}?key=${key}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({contents:[{parts:[{text:`Shopping assistant. User wants: "${searchInput}". Return ONLY JSON no markdown: {"mainSearch":"keyword","suggestions":["a","b","c"],"tip":"one tip"}`}]}]})
      });
      const data=await res.json();
      const txt=data.candidates?.[0]?.content?.parts?.[0]?.text||'{}';
      const parsed=JSON.parse(txt.replace(/```json|```/g,'').trim());
      setSugg(parsed.suggestions||[]);
      if(parsed.tip)setTip(parsed.tip);
      if(parsed.mainSearch){
        const p=new URLSearchParams(params);
        p.set('search',parsed.mainSearch);
        p.delete('category');
        p.set('page','1');
        setParams(p);
        setSearchInput(parsed.mainSearch);
      }
    }catch{
      setFilter('search',searchInput.trim());
    }finally{setAiLoad(false);}
  };

  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',paddingBottom:'5rem'}}>
      {/* Header */}
      <div style={S.hdr}>
        <div style={S.hdrGrid}/>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <h1 style={S.hTitle}>{cat||(search?`"${search}"`:'All Products')}</h1>
          <p style={{color:'var(--text2)',marginTop:'4px',fontSize:'.88rem'}}>{total} products found</p>
          {/* Search */}
          <div style={{display:'flex',gap:'8px',marginTop:'1.2rem',flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:'200px',display:'flex',alignItems:'center',gap:'8px',background:'var(--card)',border:'1.5px solid var(--border2)',borderRadius:'11px',padding:'10px 14px'}}>
              <span style={{fontSize:'1rem'}}>🤖</span>
              <input
                value={searchInput}
                onChange={e=>setSearchInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&doSearch()}
                placeholder="Search products..."
                style={{flex:1,background:'none',border:'none',outline:'none',color:'var(--text)',fontSize:'.9rem',minWidth:0}}
              />
              {searchInput&&<button onClick={()=>{setSearchInput('');setFilter('search','');}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',fontSize:'1.1rem'}}>×</button>}
            </div>
            <button onClick={doSearch} style={{background:'var(--card)',color:'var(--text)',border:'1.5px solid var(--border2)',borderRadius:'11px',padding:'10px 16px',fontWeight:600,fontSize:'.85rem',cursor:'pointer',whiteSpace:'nowrap'}}>🔍 Search</button>
            <button onClick={aiSearch} disabled={aiLoad||!searchInput.trim()} style={{background:'linear-gradient(135deg,#7C3AED,#DC2626)',color:'#fff',border:'none',borderRadius:'11px',padding:'10px 16px',fontWeight:700,fontSize:'.85rem',cursor:'pointer',whiteSpace:'nowrap',opacity:aiLoad||!searchInput.trim()?.5:1}}>
              {aiLoad?'Searching…':'✨ AI'}
            </button>
          </div>
          {sugg.length>0&&(
            <div style={{display:'flex',gap:'7px',flexWrap:'wrap',marginTop:'8px',alignItems:'center'}}>
              <span style={{fontSize:'.74rem',color:'var(--text2)'}}>Try:</span>
              {sugg.map(s=>(
                <button key={s} onClick={()=>{setFilter('search',s);setSearchInput(s);setSugg([]);}}
                  style={{background:'rgba(124,111,255,.1)',border:'1px solid rgba(124,111,255,.28)',color:'var(--p2)',padding:'4px 11px',borderRadius:'20px',fontSize:'.75rem',cursor:'pointer',fontWeight:600}}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {tip&&<div style={{marginTop:'8px',background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.18)',borderRadius:'8px',padding:'8px 12px',fontSize:'.8rem',color:'var(--gold)'}}>💡 {tip}</div>}
        </div>
      </div>

      <div className="container" style={{display:'flex',gap:isMobile?'0':'1.8rem',marginTop:'1.5rem',flexDirection:isMobile?'column':'row'}}>

        {/* Sidebar */}
        {sidebar&&(
          <aside style={{width:isMobile?'100%':'228px',flexShrink:0,marginBottom:isMobile?'1rem':0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem'}}>
              <span style={{fontFamily:'var(--display)',fontWeight:700,fontSize:'.95rem'}}>Filters</span>
              {hasF&&<button onClick={clear} style={{background:'none',border:'none',color:'var(--pink)',fontSize:'.78rem',fontWeight:600,cursor:'pointer'}}>Clear all</button>}
            </div>
            {/* Category */}
            <div style={S.fSec}>
              <div style={S.fLabel}>Category</div>
              <button onClick={()=>setFilter('category','')} style={{...S.fBtn,...(cat===''?S.fBtnA:{})}}>All</button>
              {isMobile?(
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginTop:'4px'}}>
                  {cats.map(c=>(
                    <button key={c} onClick={()=>setFilter('category',c)}
                      style={{...S.fBtn,...(cat===c?S.fBtnA:{}),justifyContent:'center',fontSize:'.78rem',padding:'6px 4px'}}>
                      <span>{CAT_ICONS[c]||'📦'}</span>
                      <span style={{fontSize:'.7rem'}}>{c}</span>
                    </button>
                  ))}
                </div>
              ):(
                cats.map(c=>(
                  <button key={c} onClick={()=>setFilter('category',c)} style={{...S.fBtn,...(cat===c?S.fBtnA:{})}}>
                    <span>{CAT_ICONS[c]||'📦'}</span>{c}
                  </button>
                ))
              )}
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
              {isMobile?(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                  {SORTS.map(([v,l])=>(
                    <button key={v} onClick={()=>setFilter('sort',v)}
                      style={{...S.fBtn,...(sort===v?S.fBtnA:{}),fontSize:'.78rem',padding:'6px 8px',justifyContent:'center'}}>
                      {l}
                    </button>
                  ))}
                </div>
              ):(
                SORTS.map(([v,l])=>(
                  <button key={v} onClick={()=>setFilter('sort',v)} style={{...S.fBtn,...(sort===v?S.fBtnA:{})}}>{l}</button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Products */}
        <div style={{flex:1,minWidth:0}}>
          {/* Toolbar */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'8px'}}>
            <div style={{display:'flex',gap:'7px',flexWrap:'wrap',alignItems:'center'}}>
              <button onClick={()=>setSidebar(!sidebar)} style={S.fToggle}>
                ☰ {sidebar?'Hide':'Show'} Filters
                {hasF&&<span style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--p)',display:'inline-block'}}/>}
              </button>
              {cat&&<Chip l={cat} r={()=>setFilter('category','')}/>}
              {search&&<Chip l={`"${search}"`} r={()=>{setFilter('search','');setSearchInput('');}}/>}
              {(min||max)&&<Chip l={`$${min||0}–$${max||'∞'}`} r={()=>{setFilter('minPrice','');setFilter('maxPrice','');}}/>}
            </div>
            <span style={{fontSize:'.8rem',color:'var(--text2)'}}>{total} results</span>
          </div>

          {/* Grid */}
          {loading?(
            <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(auto-fill,minmax(218px,1fr))',gap:isMobile?'0.7rem':'1.1rem'}}>
              {Array.from({length:isMobile?4:8}).map((_,i)=>(
                <div key={i} style={{borderRadius:'var(--r2)',overflow:'hidden',border:'1px solid var(--border)'}}>
                  <div className="skeleton" style={{height:'180px'}}/>
                  <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'6px'}}>
                    {[58,82,42].map(w=><div key={w} className="skeleton" style={{height:'9px',width:`${w}%`}}/>)}
                  </div>
                </div>
              ))}
            </div>
          ):prods.length===0?(
            <div style={{textAlign:'center',padding:'4rem 2rem'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔍</div>
              <h3 style={{fontFamily:'var(--display)',fontSize:'1.2rem',marginBottom:'7px'}}>Nothing found</h3>
              <p style={{color:'var(--text2)',marginBottom:'1.5rem',fontSize:'.9rem'}}>Try different keywords or clear filters</p>
              <button onClick={clear} style={{background:'var(--grad)',color:'#fff',border:'none',borderRadius:'10px',padding:'10px 22px',fontWeight:700,cursor:'pointer'}}>Clear Filters</button>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(auto-fill,minmax(218px,1fr))',gap:isMobile?'0.7rem':'1.1rem'}}>
              {prods.map((p,i)=>(
                <div key={p._id} style={{animation:`fadeUp .35s ease ${(i%12)*.042}s both`}}>
                  <ProductCard product={p}/>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages>1&&(
            <div style={{display:'flex',gap:'6px',justifyContent:'center',marginTop:'2.5rem',flexWrap:'wrap',alignItems:'center'}}>
              <button disabled={page===1} onClick={()=>goToPage(page-1)} style={{...S.pBtn,opacity:page===1?.35:1}}>← Prev</button>
              {Array.from({length:pages},(_,i)=>i+1).filter(n=>isMobile?(n===1||n===pages||Math.abs(n-page)<=1):true).map(n=>(
                <button key={n} onClick={()=>goToPage(n)} style={{...S.pBtn,...(n===page?S.pBtnA:{})}}>{n}</button>
              ))}
              <button disabled={page===pages} onClick={()=>goToPage(page+1)} style={{...S.pBtn,opacity:page===pages?.35:1}}>Next →</button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
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
  hdr:{background:'linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%)',padding:'2.5rem 0 1.5rem',position:'relative',borderBottom:'1px solid var(--border)',overflow:'hidden'},
  hdrGrid:{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(124,111,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,111,255,.04) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'},
  hTitle:{fontFamily:'var(--display)',fontSize:'clamp(1.3rem,4vw,2.2rem)',fontWeight:700},
  fSec:{marginBottom:'1.2rem',paddingBottom:'1.2rem',borderBottom:'1px solid var(--border)'},
  fLabel:{fontSize:'.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.09em',color:'var(--text2)',marginBottom:'8px'},
  fBtn:{display:'flex',alignItems:'center',gap:'7px',width:'100%',background:'none',border:'none',padding:'7px 9px',borderRadius:'7px',fontSize:'.84rem',color:'var(--text2)',cursor:'pointer',textAlign:'left',transition:'var(--t)',marginBottom:'2px'},
  fBtnA:{background:'rgba(124,111,255,.1)',color:'var(--p2)',fontWeight:600,border:'1px solid rgba(124,111,255,.2)'},
  pInp:{flex:1,background:'var(--card)',border:'1.5px solid var(--border)',borderRadius:'7px',padding:'8px 9px',fontSize:'.82rem',color:'var(--text)',outline:'none'},
  fToggle:{display:'inline-flex',alignItems:'center',gap:'6px',background:'var(--card)',border:'1px solid var(--border2)',borderRadius:'9px',padding:'8px 14px',fontSize:'.82rem',fontWeight:600,color:'var(--text2)',cursor:'pointer'},
  pBtn:{padding:'8px 14px',borderRadius:'9px',border:'1px solid var(--border)',background:'var(--card)',color:'var(--text2)',fontSize:'.84rem',fontWeight:600,cursor:'pointer',transition:'var(--t)',minWidth:'40px',textAlign:'center'},
  pBtnA:{background:'var(--grad)',color:'#fff',border:'none'},
};