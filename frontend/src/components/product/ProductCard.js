import{useState}from'react';
import{Link}from'react-router-dom';
import{useCart}from'../../context/CartContext';
import{useAuth}from'../../context/AuthContext';
import{toast}from'react-toastify';
import api from'../../utils/api';

export default function ProductCard({product}){
  const{addToCart}=useCart();const{user}=useAuth();
  const[adding,setAdding]=useState(false);
  const[wished,setWished]=useState(false);
  const[loaded,setLoaded]=useState(false);
  const[hov,setHov]=useState(false);

  const img=product.images?.[0]?.url||`https://placehold.co/400x300/13131F/7C6FFF?text=${encodeURIComponent((product.name||'').slice(0,10))}`;
  const disc=product.comparePrice?Math.round(((product.comparePrice-product.price)/product.comparePrice)*100):0;

  const handleAdd=async e=>{
    e.preventDefault();
    if(!user){toast.warn('Sign in to add to cart');return;}
    if(product.stock===0)return;
    setAdding(true);
    try{await addToCart(product._id);toast.success('Added to cart! 🛒');}
    catch{toast.error('Failed');}
    finally{setAdding(false);}
  };

  const handleWish=async e=>{
    e.preventDefault();
    if(!user){toast.warn('Sign in first');return;}
    try{await api.post(`/wishlist/toggle/${product._id}`);setWished(!wished);toast.success(wished?'Removed':'Saved ❤️');}
    catch{toast.error('Failed');}
  };

  return(
    <div style={{...S.card,...(hov?S.cardH:{})}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <Link to={`/products/${product._id}`} style={{display:'block',position:'relative',overflow:'hidden'}}>
        <div style={S.imgBox}>
          {!loaded&&<div className="skeleton" style={{position:'absolute',inset:0}}/>}
          <img src={img} alt={product.name} style={{...S.img,opacity:loaded?1:0,transform:hov?'scale(1.07)':'scale(1)'}} onLoad={()=>setLoaded(true)}
          onError={e=>{
            e.target.onerror=null;
            e.target.src=`https://placehold.co/400x300/13131F/7C6FFF?text=${encodeURIComponent((product.name||'Product').slice(0,15))}`;
            setLoaded(true);
          }}/>
          <div style={{...S.overlay,opacity:hov?1:0}}>
            <span style={S.overlayTxt}>Quick View →</span>
          </div>
          <div style={S.bads}>
            {disc>0&&<span style={{...S.bad,background:'var(--pink)'}}>-{disc}%</span>}
            {product.isFeatured&&<span style={{...S.bad,background:'var(--p)'}}>🔥</span>}
            {product.stock===0&&<span style={{...S.bad,background:'rgba(248,113,113,.85)'}}>Out</span>}
          </div>
        </div>
      </Link>

      <button style={{...S.wish,...(wished?S.wishA:{})}} onClick={handleWish}>{wished?'♥':'♡'}</button>

      <div style={S.body}>
        <div style={S.topRow}>
          <span style={S.cat}>{product.category}</span>
          {product.brand&&<span style={S.brand}>{product.brand}</span>}
        </div>
        <Link to={`/products/${product._id}`}><h3 style={S.name}>{product.name}</h3></Link>
        <div style={S.stars}>
          <span style={{color:'var(--gold)',fontSize:'.8rem',letterSpacing:'1px'}}>{Array.from({length:5},(_,i)=>i<Math.round(product.rating||0)?'★':'☆').join('')}</span>
          <span style={{fontSize:'.72rem',color:'var(--text3)'}}>({product.numReviews||0})</span>
        </div>
        <div style={S.footer}>
          <div>
            <span style={S.price}>${product.price?.toFixed(2)}</span>
            {product.comparePrice&&<span style={S.old}>${product.comparePrice.toFixed(2)}</span>}
          </div>
          {product.stock===0?<span style={{fontSize:'.74rem',color:'var(--red)'}}>Sold out</span>:(
            <button style={{...S.addBtn,...(adding?{opacity:.7}:{})}} onClick={handleAdd} disabled={adding}>
              {adding?<span style={{width:'13px',height:'13px',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .6s linear infinite'}}/>
                :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
            </button>
          )}
        </div>
        {product.stock>0&&product.stock<=5&&<div style={S.low}>⚡ Only {product.stock} left</div>}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S={
  card:{background:'var(--card)',borderRadius:'var(--r2)',border:'1px solid var(--border)',overflow:'hidden',position:'relative',transition:'all .22s ease'},
  cardH:{transform:'translateY(-5px)',border:'1px solid var(--border2)',boxShadow:'0 20px 50px rgba(0,0,0,.5),0 0 0 1px rgba(124,111,255,.08)'},
  imgBox:{position:'relative',height:'225px',overflow:'hidden',background:'var(--bg3)'},
  img:{width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s ease,opacity .25s ease'},
  overlay:{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(7,7,15,.85),rgba(124,111,255,.25))',display:'flex',alignItems:'center',justifyContent:'center',transition:'opacity .22s ease'},
  overlayTxt:{color:'#fff',fontWeight:700,fontSize:'.84rem',letterSpacing:'.04em',background:'rgba(124,111,255,.7)',padding:'7px 16px',borderRadius:'20px',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)'},
  bads:{position:'absolute',top:'10px',left:'10px',display:'flex',flexDirection:'column',gap:'4px',zIndex:2},
  bad:{padding:'3px 8px',borderRadius:'6px',fontSize:'.68rem',fontWeight:700,color:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,.3)'},
  wish:{position:'absolute',top:'10px',right:'10px',width:'30px',height:'30px',borderRadius:'50%',background:'rgba(19,19,31,.88)',backdropFilter:'blur(8px)',border:'1px solid var(--border)',cursor:'pointer',fontSize:'.95rem',color:'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',transition:'var(--t)',zIndex:3},
  wishA:{color:'var(--pink)',borderColor:'var(--pink)',background:'rgba(255,107,157,.1)'},
  body:{padding:'13px 14px 15px'},
  topRow:{display:'flex',justifyContent:'space-between',marginBottom:'5px'},
  cat:{fontSize:'.67rem',fontWeight:700,color:'var(--p2)',textTransform:'uppercase',letterSpacing:'.07em'},
  brand:{fontSize:'.67rem',color:'var(--text3)',textTransform:'uppercase'},
  name:{fontSize:'.88rem',fontWeight:600,color:'var(--text)',marginBottom:'6px',lineHeight:'1.3',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'},
  stars:{display:'flex',alignItems:'center',gap:'5px',marginBottom:'9px'},
  footer:{display:'flex',alignItems:'center',justifyContent:'space-between'},
  price:{fontFamily:'var(--display)',fontSize:'1.05rem',fontWeight:700,color:'var(--text)'},
  old:{fontSize:'.76rem',color:'var(--text3)',textDecoration:'line-through',marginLeft:'5px'},
  addBtn:{width:'32px',height:'32px',borderRadius:'9px',background:'var(--grad)',color:'#fff',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'var(--t)',boxShadow:'0 4px 12px var(--pglow)'},
  low:{marginTop:'6px',fontSize:'.7rem',color:'var(--gold)',fontWeight:600,background:'rgba(251,191,36,.07)',borderRadius:'5px',padding:'3px 7px',border:'1px solid rgba(251,191,36,.18)',display:'inline-block'},
};