import{useState,useEffect}from'react';
import{Link,useNavigate,useLocation}from'react-router-dom';
import{useAuth}from'../context/AuthContext';
import{useCart}from'../context/CartContext';

export default function Navbar(){
  const{user,logout}=useAuth();
  const{cartCount}=useCart();
  const nav=useNavigate(),loc=useLocation();
  const[scrolled,setScrolled]=useState(false);
  const[mob,setMob]=useState(false);
  const[search,setSearch]=useState(false);
  const[q,setQ]=useState('');
  const[drop,setDrop]=useState(false);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>24);
    window.addEventListener('scroll',fn);return()=>window.removeEventListener('scroll',fn);
  },[]);
  useEffect(()=>{setMob(false);setDrop(false);},[loc]);

  const go=e=>{e.preventDefault();if(q.trim()){nav(`/products?search=${encodeURIComponent(q)}`);setSearch(false);setQ('');}};

  return(
    <>
      <nav style={{...S.nav,...(scrolled?S.navS:{})}}>
        <div style={S.inner}>
          <Link to="/" style={S.logo}>
            <div style={S.logoBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#g1)" strokeWidth="2.2" strokeLinecap="round"/>
                <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C6FFF"/><stop offset="100%" stopColor="#FF6B9D"/></linearGradient></defs>
              </svg>
            </div>
            <span style={{fontFamily:'var(--display)',fontWeight:800,fontSize:'1.1rem',letterSpacing:'.04em'}}>
              NEXUS<span style={{color:'var(--p)'}}>SHOP</span>
            </span>
          </Link>

          <div style={S.links}>
            {[['/',  'Home'],['/products','Shop']].map(([p,l])=>(
              <Link key={p} to={p} style={{...S.link,...(loc.pathname===p?S.linkA:{})}}>
                {l}{loc.pathname===p&&<span style={S.dot}/>}
              </Link>
            ))}
            {user&&<Link to="/orders" style={{...S.link,...(loc.pathname.startsWith('/orders')?S.linkA:{})}}>Orders</Link>}
            {user?.role==='admin'&&<Link to="/admin" style={S.adminPill}>⚡ Admin</Link>}
          </div>

          <div style={S.actions}>
            <button style={S.icon} onClick={()=>setSearch(!search)} title="Search">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            {user&&(
              <Link to="/cart" style={S.cartWrap}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                {cartCount>0&&<span style={S.badge}>{cartCount}</span>}
              </Link>
            )}
            {user?(
              <div style={{position:'relative'}} onMouseEnter={()=>setDrop(true)} onMouseLeave={()=>setDrop(false)}>
                <div style={S.ava}>{user.name?.charAt(0).toUpperCase()}</div>
                {drop&&(
                  <div style={S.drop}>
                    <div style={S.dropHead}>
                      <div style={S.dropAva}>{user.name?.charAt(0).toUpperCase()}</div>
                      <div><div style={{fontWeight:700,fontSize:'.88rem'}}>{user.name}</div><div style={{fontSize:'.72rem',color:'var(--text2)'}}>{user.email}</div></div>
                    </div>
                    {[['/profile','👤','Profile'],['/orders','📦','Orders'],['/wishlist','❤️','Wishlist'],...(user.role==='admin'?[['/admin','⚡','Admin Panel']]:[])]
                      .map(([to,ic,lb])=><Link key={to} to={to} style={S.dropItem}><span>{ic}</span>{lb}</Link>)}
                    <div style={{borderTop:'1px solid var(--border)',margin:'4px 0'}}/>
                    <button onClick={()=>{logout();nav('/');}} style={S.dropOut}>Sign Out</button>
                  </div>
                )}
              </div>
            ):(
              <div style={{display:'flex',gap:'7px'}}>
                <Link to="/login" style={S.signIn}>Sign In</Link>
                <Link to="/register" style={S.getStart}>Get Started</Link>
              </div>
            )}
            <button style={S.ham} onClick={()=>setMob(!mob)}>
              {[0,1,2].map(i=><span key={i} style={{...S.hline,...(mob?[{transform:'rotate(45deg) translate(5px,5px)'},{opacity:0},{transform:'rotate(-45deg) translate(5px,-5px)'}][i]:{})}}/>)}
            </button>
          </div>
        </div>

        {search&&(
          <div style={S.searchBar}>
            <form onSubmit={go} style={S.searchForm}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" style={{flexShrink:0}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products, brands, categories..." style={S.sInput}/>
              <button type="submit" style={S.sBtn}>Search</button>
              <button type="button" onClick={()=>setSearch(false)} style={{...S.sBtn,background:'var(--card2)',color:'var(--text2)'}}>✕</button>
            </form>
          </div>
        )}
      </nav>

      {mob&&(
        <div style={S.mNav}>
          {[['/',  'Home'],['/products','Shop'],...(user?[['/orders','Orders'],['/cart',`Cart${cartCount?` (${cartCount})`:''}`],['/wishlist','Wishlist'],['/profile','Profile']]:[]),(user?.role==='admin'?['/admin','⚡ Admin']:null)].filter(Boolean)
            .map(([to,lb])=><Link key={to} to={to} style={S.mLink}>{lb}</Link>)}
          {user?<button onClick={()=>{logout();nav('/');}} style={{...S.mLink,background:'none',border:'none',color:'var(--pink)',textAlign:'left',width:'100%'}}>Sign Out</button>
            :<><Link to="/login" style={S.mLink}>Sign In</Link><Link to="/register" style={{...S.mLink,color:'var(--p)'}}>Get Started →</Link></>}
        </div>
      )}
    </>
  );
}

const S={
  nav:{position:'fixed',top:0,left:0,right:0,zIndex:1000,transition:'all .3s ease'},
  navS:{background:'rgba(7,7,15,.94)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderBottom:'1px solid var(--border)'},
  inner:{maxWidth:'1300px',margin:'0 auto',padding:'0 1.5rem',height:'68px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'2rem'},
  logo:{display:'flex',alignItems:'center',gap:'9px',flexShrink:0},
  logoBox:{width:'34px',height:'34px',background:'var(--card)',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--border2)'},
  links:{display:'flex',alignItems:'center',gap:'1.8rem'},
  link:{fontSize:'.86rem',fontWeight:500,color:'var(--text2)',transition:'var(--t)',position:'relative',paddingBottom:'2px'},
  linkA:{color:'var(--text)'},
  dot:{position:'absolute',bottom:'-5px',left:'50%',transform:'translateX(-50%)',width:'4px',height:'4px',borderRadius:'50%',background:'var(--p)',display:'block'},
  adminPill:{background:'rgba(124,111,255,.12)',color:'var(--p2)',padding:'4px 12px',borderRadius:'20px',fontSize:'.78rem',fontWeight:700,border:'1px solid rgba(124,111,255,.25)'},
  actions:{display:'flex',alignItems:'center',gap:'5px'},
  icon:{width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'none',color:'var(--text2)',borderRadius:'8px',cursor:'pointer',transition:'var(--t)'},
  cartWrap:{position:'relative',width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',borderRadius:'8px',transition:'var(--t)'},
  badge:{position:'absolute',top:'-1px',right:'-1px',width:'15px',height:'15px',borderRadius:'50%',background:'var(--p)',color:'#fff',fontSize:'.6rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'},
  ava:{width:'32px',height:'32px',borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.83rem',cursor:'pointer',color:'#fff',fontFamily:'var(--display)'},
  drop:{position:'absolute',top:'calc(100% + 10px)',right:0,background:'var(--card)',border:'1px solid var(--border2)',borderRadius:'var(--r2)',minWidth:'210px',boxShadow:'var(--shadow2)',overflow:'hidden',zIndex:999},
  dropHead:{padding:'14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'10px'},
  dropAva:{width:'34px',height:'34px',borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',flexShrink:0,fontSize:'.83rem'},
  dropItem:{display:'flex',alignItems:'center',gap:'9px',padding:'9px 14px',fontSize:'.85rem',color:'var(--text2)',transition:'var(--t)'},
  dropOut:{display:'block',width:'100%',padding:'9px 14px',background:'none',border:'none',color:'var(--pink)',fontSize:'.85rem',textAlign:'left',cursor:'pointer',fontFamily:'var(--font)'},
  signIn:{padding:'7px 15px',borderRadius:'8px',fontSize:'.83rem',fontWeight:500,color:'var(--text2)',border:'1px solid var(--border)',transition:'var(--t)'},
  getStart:{padding:'7px 15px',borderRadius:'8px',fontSize:'.83rem',fontWeight:700,background:'var(--grad)',color:'#fff',border:'none',transition:'var(--t)',boxShadow:'0 4px 14px var(--pglow)'},
  ham:{display:'none',flexDirection:'column',gap:'5px',background:'none',border:'none',padding:'4px',cursor:'pointer'},
  hline:{display:'block',width:'20px',height:'2px',background:'var(--text)',borderRadius:'2px',transition:'var(--t)'},
  searchBar:{background:'var(--bg2)',borderTop:'1px solid var(--border)',padding:'10px 1.5rem'},
  searchForm:{maxWidth:'680px',margin:'0 auto',display:'flex',alignItems:'center',gap:'9px',background:'var(--card)',borderRadius:'11px',padding:'10px 14px',border:'1px solid var(--border2)'},
  sInput:{flex:1,background:'none',border:'none',outline:'none',color:'var(--text)',fontSize:'.9rem'},
  sBtn:{background:'var(--grad)',color:'#fff',border:'none',borderRadius:'7px',padding:'6px 14px',fontWeight:600,fontSize:'.8rem',cursor:'pointer'},
  mNav:{position:'fixed',top:'68px',left:0,right:0,zIndex:998,background:'var(--bg2)',borderBottom:'1px solid var(--border)',padding:'.8rem',display:'flex',flexDirection:'column',gap:'2px'},
  mLink:{padding:'11px 14px',color:'var(--text2)',borderRadius:'8px',fontSize:'.9rem',fontWeight:500,transition:'var(--t)',display:'block'},
};
