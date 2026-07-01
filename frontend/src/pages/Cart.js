import{Link,useNavigate}from'react-router-dom';
import{useCart}from'../context/CartContext';
export default function Cart(){
  const{cart,cartTotal,updateQuantity,removeFromCart}=useCart();
  const nav=useNavigate();
  const ship=cartTotal>=50?0:4.99;
  const tax=cartTotal*0.08;
  const total=cartTotal+ship+tax;
  if(!cart.items?.length)return(
    <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem'}}>
      <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🛒</div>
      <h2 style={{fontFamily:'var(--display)',fontSize:'1.6rem',fontWeight:700,marginBottom:'8px'}}>Cart is empty</h2>
      <p style={{color:'var(--text2)',marginBottom:'2rem'}}>Add some amazing products!</p>
      <Link to="/products" style={{background:'var(--grad)',color:'#fff',padding:'13px 28px',borderRadius:'11px',fontWeight:700,fontSize:'.92rem',boxShadow:'0 4px 16px var(--pglow)'}}>Shop Now →</Link>
    </div>
  );
  return(
    <div style={{maxWidth:'1100px',margin:'2rem auto',padding:'0 1.5rem 5rem'}}>
      <h1 style={{fontFamily:'var(--display)',fontSize:'1.9rem',fontWeight:700,marginBottom:'4px'}}>Shopping Cart</h1>
      <p style={{color:'var(--text2)',marginBottom:'2rem',fontSize:'.88rem'}}>{cart.items.length} item{cart.items.length!==1?'s':''}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'2rem',alignItems:'start'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {cart.items.map(item=>{
            const img=item.product?.images?.[0]?.url||`https://placehold.co/90x90/13131F/7C6FFF?text=P`;
            return(
              <div key={item.product?._id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1rem',background:'var(--card)',borderRadius:'var(--r2)',border:'1px solid var(--border)',transition:'var(--t)'}}>
                <Link to={`/products/${item.product?._id}`}><img src={img} alt={item.product?.name} style={{width:'80px',height:'80px',objectFit:'cover',borderRadius:'10px',background:'var(--bg3)',flexShrink:0}}/></Link>
                <div style={{flex:1,minWidth:0}}>
                  <Link to={`/products/${item.product?._id}`}><div style={{fontWeight:600,fontSize:'.9rem',marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.product?.name}</div></Link>
                  <div style={{color:'var(--text2)',fontSize:'.82rem'}}>${item.price?.toFixed(2)} each</div>
                  {item.product?.stock<5&&item.product?.stock>0&&<div style={{fontSize:'.72rem',color:'var(--gold)',marginTop:'3px'}}>⚡ Only {item.product.stock} left</div>}
                </div>
                <div style={{display:'flex',alignItems:'center',border:'1px solid var(--border)',borderRadius:'9px',overflow:'hidden'}}>
                  <button onClick={()=>updateQuantity(item.product._id,item.quantity-1)} style={{width:'32px',height:'36px',background:'var(--card2)',border:'none',cursor:'pointer',color:'var(--text)',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                  <span style={{width:'36px',textAlign:'center',fontWeight:700,fontSize:'.9rem'}}>{item.quantity}</span>
                  <button onClick={()=>updateQuantity(item.product._id,item.quantity+1)} style={{width:'32px',height:'36px',background:'var(--card2)',border:'none',cursor:'pointer',color:'var(--text)',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                </div>
                <div style={{fontFamily:'var(--display)',fontWeight:700,fontSize:'1rem',minWidth:'65px',textAlign:'right'}}>${(item.price*item.quantity).toFixed(2)}</div>
                <button onClick={()=>removeFromCart(item.product._id)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',padding:'6px',borderRadius:'7px',transition:'var(--t)'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                </button>
              </div>
            );
          })}
          {cartTotal>=50?<div style={{padding:'.9rem 1.1rem',background:'rgba(52,211,153,.08)',border:'1px solid rgba(52,211,153,.22)',borderRadius:'10px',color:'var(--green)',fontWeight:600,fontSize:'.86rem'}}>🎉 Free shipping unlocked!</div>
            :<div style={{padding:'.9rem 1.1rem',background:'rgba(251,191,36,.07)',border:'1px solid rgba(251,191,36,.18)',borderRadius:'10px'}}>
              <div style={{fontSize:'.84rem',color:'var(--text2)',marginBottom:'7px'}}>🚚 Add <strong style={{color:'var(--gold)'}}>${(50-cartTotal).toFixed(2)}</strong> for free shipping</div>
              <div style={{height:'5px',background:'var(--border)',borderRadius:'3px'}}><div style={{height:'100%',width:`${Math.min((cartTotal/50)*100,100)}%`,background:'var(--gold)',borderRadius:'3px',transition:'width .5s ease'}}/></div>
            </div>}
        </div>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r2)',padding:'1.5rem',position:'sticky',top:'80px'}}>
          <h3 style={{fontFamily:'var(--display)',fontWeight:700,marginBottom:'1.2rem',fontSize:'1rem'}}>Order Summary</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'9px',borderBottom:'1px solid var(--border)',paddingBottom:'1rem',marginBottom:'1rem'}}>
            {[['Subtotal',`$${cartTotal.toFixed(2)}`],['Shipping',ship===0?'FREE':'$'+ship.toFixed(2)],['Tax (8%)',`$${tax.toFixed(2)}`]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:'.88rem',color:'var(--text2)'}}><span>{l}</span><span style={{color:v==='FREE'?'var(--green)':undefined,fontWeight:v==='FREE'?600:400}}>{v}</span></div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:'1.05rem',fontFamily:'var(--display)',marginBottom:'1.4rem'}}><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button onClick={()=>nav('/checkout')} style={{width:'100%',padding:'13px',background:'var(--grad)',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,fontSize:'.92rem',cursor:'pointer',boxShadow:'0 4px 16px var(--pglow)',marginBottom:'1rem'}}>Checkout →</button>
          <Link to="/products" style={{display:'block',textAlign:'center',color:'var(--text2)',fontSize:'.84rem',marginBottom:'1rem'}}>← Continue Shopping</Link>
          <div style={{textAlign:'center',fontSize:'.74rem',color:'var(--text3)',background:'var(--bg2)',borderRadius:'8px',padding:'8px'}}>🔒 Secured by Stripe</div>
        </div>
      </div>
    </div>
  );
}
