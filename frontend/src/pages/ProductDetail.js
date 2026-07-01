import{useEffect,useState}from'react';
import{useParams,Link}from'react-router-dom';
import{useCart}from'../context/CartContext';
import{useAuth}from'../context/AuthContext';
import api from'../utils/api';
import{toast}from'react-toastify';

const GEM=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

export default function ProductDetail(){
  const{id}=useParams();
  const[product,setProduct]=useState(null);
  const[qty,setQty]=useState(1);
  const[activeImg,setActiveImg]=useState(0);
  const[review,setReview]=useState({rating:5,comment:''});
  const[submitting,setSubmitting]=useState(false);
  const[wished,setWished]=useState(false);
  const[adding,setAdding]=useState(false);
  const[aiSummary,setAiSummary]=useState(null);
  const[aiLoading,setAiLoading]=useState(false);
  const{addToCart}=useCart();const{user}=useAuth();

  useEffect(()=>{
    setProduct(null);
    api.get(`/products/${id}`).then(r=>setProduct(r.data)).catch(console.error);
    window.scrollTo(0,0);
  },[id]);

  const handleAdd=async()=>{
    if(!user){toast.warn('Sign in first');return;}
    setAdding(true);
    try{await addToCart(id,qty);toast.success(`Added ${qty} item${qty>1?'s':''} to cart! 🛒`);}
    catch{toast.error('Failed');}
    finally{setAdding(false);}
  };

  const handleWish=async()=>{
    if(!user){toast.warn('Sign in first');return;}
    try{await api.post(`/wishlist/toggle/${id}`);setWished(!wished);toast.success(wished?'Removed':'Saved ❤️');}
    catch{toast.error('Failed');}
  };

  const handleReview=async e=>{
    e.preventDefault();if(!review.comment.trim())return;
    setSubmitting(true);
    try{await api.post(`/products/${id}/reviews`,review);toast.success('Review posted!');const r=await api.get(`/products/${id}`);setProduct(r.data);setReview({rating:5,comment:''});}
    catch(err){toast.error(err.response?.data?.message||'Failed');}
    finally{setSubmitting(false);}
  };

  const summarizeReviews=async()=>{
    if(!product?.reviews?.length)return;
    setAiLoading(true);setAiSummary(null);
    try{
      const key=process.env.REACT_APP_GEMINI_API_KEY;
      const text=product.reviews.slice(0,15).map(r=>`${r.rating}/5: "${r.comment}"`).join('\n');
      const res=await fetch(`${GEM}?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({contents:[{parts:[{text:`Analyze these product reviews for "${product.name}". Return ONLY JSON no markdown: {"verdict":"Highly Recommended|Recommended|Mixed|Not Recommended","score":85,"pros":["a","b","c"],"cons":["x"],"summary":"2 sentences","tip":"buying tip"}\n\nReviews:\n${text}`}]}]})});
      const data=await res.json();
      const txt=data.candidates?.[0]?.content?.parts?.[0]?.text||'{}';
      setAiSummary(JSON.parse(txt.replace(/```json|```/g,'').trim()));
    }catch{setAiSummary({error:true});}
    finally{setAiLoading(false);}
  };

  const disc=product?.comparePrice?Math.round(((product.comparePrice-product.price)/product.comparePrice)*100):0;

  if(!product)return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid var(--border)',borderTopColor:'var(--p)',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  const imgs=product.images?.length>0?product.images:[{url:`https://placehold.co/600x500/13131F/7C6FFF?text=${encodeURIComponent(product.name)}`}];

  return(
    <div style={{maxWidth:'1200px',margin:'2rem auto',padding:'0 1.5rem 6rem'}}>
      {/* Breadcrumb */}
      <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'2rem',fontSize:'.82rem',flexWrap:'wrap'}}>
        {[['/',  'Home'],['/products','Products'],[`/products?category=${product.category}`,product.category]].map(([to,l],i)=>(
          <span key={to} style={{display:'flex',alignItems:'center',gap:'6px'}}>{i>0&&<span style={{color:'var(--text3)'}}>›</span>}<Link to={to} style={{color:'var(--text2)',transition:'var(--t)'}}>{l}</Link></span>
        ))}
        <span style={{color:'var(--text3)'}}>›</span><span style={{color:'var(--text3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'200px'}}>{product.name}</span>
      </div>

      {/* Main Grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem',marginBottom:'4rem'}}>
        {/* Images */}
        <div>
          <div style={{position:'relative',borderRadius:'var(--r2)',overflow:'hidden',marginBottom:'10px',background:'var(--card)',aspectRatio:'1',border:'1px solid var(--border)'}}>
            {disc>0&&<span style={{position:'absolute',top:'14px',left:'14px',background:'var(--pink)',color:'#fff',padding:'3px 10px',borderRadius:'20px',fontWeight:700,fontSize:'.78rem',zIndex:2}}>-{disc}%</span>}
            <img src={imgs[activeImg]?.url} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
          {imgs.length>1&&(
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {imgs.map((img,i)=>(
                <div key={i} onClick={()=>setActiveImg(i)} style={{width:'68px',height:'68px',borderRadius:'10px',overflow:'hidden',border:`2px solid ${i===activeImg?'var(--p)':'var(--border)'}`,cursor:'pointer',background:'var(--card)',flexShrink:0,transition:'var(--t)'}}>
                  <img src={img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'12px'}}>
            <Link to={`/products?category=${product.category}`} style={{background:'rgba(124,111,255,.1)',color:'var(--p2)',padding:'4px 12px',borderRadius:'20px',fontSize:'.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',border:'1px solid rgba(124,111,255,.22)'}}>{product.category}</Link>
            {product.brand&&<span style={{background:'var(--card2)',color:'var(--text2)',padding:'4px 12px',borderRadius:'20px',fontSize:'.72rem',fontWeight:600}}>{product.brand}</span>}
          </div>
          <h1 style={{fontFamily:'var(--display)',fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:700,lineHeight:'1.2',marginBottom:'.9rem'}}>{product.name}</h1>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'1rem'}}>
            <span style={{color:'var(--gold)',fontSize:'1rem',letterSpacing:'1px'}}>{Array.from({length:5},(_,i)=>i<Math.round(product.rating||0)?'★':'☆').join('')}</span>
            <span style={{fontWeight:600,fontSize:'.9rem'}}>{product.rating?.toFixed(1)}</span>
            <span style={{color:'var(--text2)',fontSize:'.84rem'}}>({product.numReviews} reviews)</span>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:'12px',marginBottom:'1rem',flexWrap:'wrap'}}>
            <span style={{fontFamily:'var(--display)',fontSize:'2rem',fontWeight:700}}>${product.price?.toFixed(2)}</span>
            {product.comparePrice&&<span style={{fontSize:'.95rem',color:'var(--text3)',textDecoration:'line-through'}}>${product.comparePrice.toFixed(2)}</span>}
            {product.comparePrice&&<span style={{background:'rgba(52,211,153,.1)',color:'var(--green)',padding:'3px 9px',borderRadius:'20px',fontSize:'.78rem',fontWeight:700,border:'1px solid rgba(52,211,153,.22)'}}>Save ${(product.comparePrice-product.price).toFixed(2)}</span>}
          </div>
          <p style={{color:'var(--text2)',lineHeight:'1.8',marginBottom:'1.4rem',fontSize:'.92rem'}}>{product.description}</p>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'1.4rem'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:product.stock>0?'var(--green)':'var(--red)',boxShadow:`0 0 8px ${product.stock>0?'var(--green)':'var(--red)'}`}}/>
            <span style={{fontSize:'.88rem',color:product.stock>0?'var(--green)':'var(--red)',fontWeight:600}}>
              {product.stock>10?'In Stock':product.stock>0?`Only ${product.stock} left!`:'Out of Stock'}
            </span>
          </div>

          {/* Qty + Add */}
          <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'1.4rem',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',border:'1.5px solid var(--border)',borderRadius:'10px',overflow:'hidden'}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:'36px',height:'44px',background:'var(--card2)',border:'none',cursor:'pointer',color:'var(--text)',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
              <span style={{width:'42px',textAlign:'center',fontWeight:700,fontSize:'.95rem'}}>{qty}</span>
              <button onClick={()=>setQty(q=>Math.min(product.stock,q+1))} style={{width:'36px',height:'44px',background:'var(--card2)',border:'none',cursor:'pointer',color:'var(--text)',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
            </div>
            <button onClick={handleAdd} disabled={product.stock===0||adding} style={{flex:1,height:'44px',background:product.stock===0?'var(--card2)':'var(--grad)',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,fontSize:'.9rem',cursor:product.stock===0?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:product.stock>0?'0 4px 16px var(--pglow)':'none',minWidth:'140px',transition:'var(--t)'}}>
              {adding?<span style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .6s linear infinite'}}/>:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
              {product.stock===0?'Out of Stock':'Add to Cart'}
            </button>
            <button onClick={handleWish} style={{width:'44px',height:'44px',border:`1.5px solid ${wished?'var(--pink)':'var(--border)'}`,background:wished?'rgba(255,107,157,.1)':'var(--card)',borderRadius:'10px',fontSize:'1.2rem',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:wished?'var(--pink)':'var(--text3)',transition:'var(--t)',flexShrink:0}}>
              {wished?'♥':'♡'}
            </button>
          </div>

          {/* Trust */}
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
            {[['🚚','Free ship $50+'],['↩️','30-day return'],['🔒','Secure pay']].map(([ic,t])=>(
              <div key={t} style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'.76rem',color:'var(--text2)'}}><span>{ic}</span>{t}</div>
            ))}
          </div>

          {/* Specs */}
          {product.specifications?.length>0&&(
            <div style={{background:'var(--card2)',borderRadius:'var(--r)',padding:'1.1rem',border:'1px solid var(--border)'}}>
              <div style={{fontSize:'.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text2)',marginBottom:'10px'}}>Specifications</div>
              {product.specifications.map((s,i)=>(
                <div key={i} style={{display:'flex',gap:'1rem',padding:'7px 0',borderBottom:i<product.specifications.length-1?'1px solid var(--border)':'none',fontSize:'.85rem'}}>
                  <span style={{color:'var(--text2)',minWidth:'130px',flexShrink:0}}>{s.key}</span>
                  <span style={{color:'var(--text)'}}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div style={{borderTop:'1px solid var(--border)',paddingTop:'3rem'}}>
        <h2 style={{fontFamily:'var(--display)',fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem'}}>Reviews ({product.numReviews})</h2>

        {/* AI Summary Button */}
        {product.reviews?.length>0&&!aiSummary&&(
          <button onClick={summarizeReviews} disabled={aiLoading} style={{display:'flex',alignItems:'center',gap:'9px',padding:'12px 20px',borderRadius:'11px',background:'linear-gradient(135deg,rgba(124,111,255,.08),rgba(255,107,157,.08))',border:'1.5px solid rgba(124,111,255,.2)',cursor:'pointer',width:'100%',justifyContent:'center',marginBottom:'1.5rem',fontWeight:600,fontSize:'.88rem',color:'var(--text)',transition:'var(--t)'}}>
            {aiLoading?<span style={{width:'16px',height:'16px',border:'2px solid rgba(124,111,255,.3)',borderTopColor:'var(--p)',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/>:<span>✨</span>}
            {aiLoading?'Analyzing reviews…':'Summarize all reviews with AI'}
            <span style={{background:'var(--grad)',color:'#fff',padding:'2px 8px',borderRadius:'20px',fontSize:'.68rem',fontWeight:700}}>AI</span>
          </button>
        )}

        {/* AI Summary Result */}
        {aiSummary&&!aiSummary.error&&(
          <div style={{background:'linear-gradient(135deg,rgba(124,111,255,.06),rgba(255,107,157,.06))',border:'1.5px solid rgba(124,111,255,.18)',borderRadius:'var(--r2)',padding:'1.5rem',marginBottom:'2rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem',flexWrap:'wrap',gap:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'1.2rem'}}>✨</span>
                <div><div style={{fontFamily:'var(--display)',fontWeight:700,fontSize:'.95rem'}}>AI Review Summary</div><div style={{fontSize:'.72rem',color:'var(--text2)'}}>Based on {product.reviews.length} reviews</div></div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700,fontSize:'.85rem',color:{'Highly Recommended':'var(--green)','Recommended':'var(--cyan)','Mixed':'var(--gold)','Not Recommended':'var(--red)'}[aiSummary.verdict]||'var(--text)'}}>{aiSummary.verdict}</div>
                <div style={{height:'4px',width:'80px',background:'var(--border)',borderRadius:'2px',marginTop:'5px',marginLeft:'auto'}}><div style={{height:'100%',width:`${aiSummary.score}%`,background:'var(--grad)',borderRadius:'2px'}}/></div>
                <div style={{fontSize:'.7rem',color:'var(--text2)',marginTop:'3px'}}>{aiSummary.score}/100</div>
              </div>
            </div>
            <p style={{color:'var(--text2)',fontSize:'.87rem',lineHeight:'1.7',marginBottom:'1rem'}}>{aiSummary.summary}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
              {aiSummary.pros?.length>0&&<div><div style={{fontSize:'.72rem',fontWeight:700,color:'var(--green)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'7px'}}>✅ Pros</div>{aiSummary.pros.map(p=><div key={p} style={{fontSize:'.82rem',color:'var(--text)',marginBottom:'4px'}}>• {p}</div>)}</div>}
              {aiSummary.cons?.length>0&&<div><div style={{fontSize:'.72rem',fontWeight:700,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'7px'}}>⚠️ Cons</div>{aiSummary.cons.map(c=><div key={c} style={{fontSize:'.82rem',color:'var(--text)',marginBottom:'4px'}}>• {c}</div>)}</div>}
            </div>
            {aiSummary.tip&&<div style={{background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.18)',borderRadius:'8px',padding:'9px 13px',fontSize:'.82rem',color:'var(--text)'}}>💡 <strong>Tip:</strong> {aiSummary.tip}</div>}
            <button onClick={()=>setAiSummary(null)} style={{background:'none',border:'none',color:'var(--text3)',fontSize:'.75rem',cursor:'pointer',marginTop:'10px'}}>Regenerate</button>
          </div>
        )}

        {/* Write Review */}
        {user?(
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r2)',padding:'1.4rem',marginBottom:'2rem'}}>
            <h3 style={{fontFamily:'var(--display)',fontWeight:700,fontSize:'.95rem',marginBottom:'1rem'}}>Write a Review</h3>
            <form onSubmit={handleReview}>
              <div style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'10px'}}>
                {[1,2,3,4,5].map(r=><button key={r} type="button" onClick={()=>setReview({...review,rating:r})} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:r<=review.rating?'var(--gold)':'var(--border)',transition:'var(--t)',padding:'2px'}}>{r<=review.rating?'★':'☆'}</button>)}
                <span style={{fontSize:'.83rem',color:'var(--text2)',marginLeft:'8px'}}>{['','Poor','Fair','Good','Great','Excellent'][review.rating]}</span>
              </div>
              <textarea value={review.comment} onChange={e=>setReview({...review,comment:e.target.value})} placeholder="Share your experience…" required style={{width:'100%',padding:'11px',background:'var(--bg2)',border:'1.5px solid var(--border)',borderRadius:'10px',minHeight:'90px',resize:'vertical',fontSize:'.88rem',color:'var(--text)',outline:'none',boxSizing:'border-box',fontFamily:'var(--font)',marginBottom:'10px'}}/>
              <button type="submit" disabled={submitting} style={{padding:'10px 24px',background:'var(--grad)',color:'#fff',border:'none',borderRadius:'9px',fontWeight:700,fontSize:'.87rem',cursor:'pointer',boxShadow:'0 4px 14px var(--pglow)'}}>
                {submitting?'Posting…':'Post Review'}
              </button>
            </form>
          </div>
        ):(
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'1rem 1.4rem',marginBottom:'2rem',fontSize:'.88rem',color:'var(--text2)'}}>
            <Link to="/login" style={{color:'var(--p)',fontWeight:700}}>Sign in</Link> to write a review
          </div>
        )}

        {/* Review List */}
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {product.reviews?.map(r=>(
            <div key={r._id} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r2)',padding:'1.1rem'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:'10px',marginBottom:'8px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'var(--grad)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontFamily:'var(--display)',flexShrink:0}}>{r.name?.charAt(0).toUpperCase()}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                    <strong style={{fontSize:'.88rem'}}>{r.name}</strong>
                    {r.verifiedPurchase&&<span style={{background:'rgba(52,211,153,.1)',color:'var(--green)',fontSize:'.68rem',padding:'2px 7px',borderRadius:'12px',fontWeight:600,border:'1px solid rgba(52,211,153,.2)'}}>✓ Verified</span>}
                  </div>
                  <div style={{display:'flex',gap:'2px',marginTop:'3px'}}>
                    {Array.from({length:5},(_,i)=><span key={i} style={{color:i<r.rating?'var(--gold)':'var(--border)',fontSize:'.82rem'}}>{i<r.rating?'★':'☆'}</span>)}
                  </div>
                </div>
                <span style={{fontSize:'.74rem',color:'var(--text3)'}}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{color:'var(--text2)',fontSize:'.87rem',lineHeight:'1.65'}}>{r.comment}</p>
            </div>
          ))}
          {!product.reviews?.length&&<p style={{color:'var(--text3)',textAlign:'center',padding:'2rem',fontSize:'.9rem'}}>No reviews yet. Be the first! ✨</p>}
        </div>
      </div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}
