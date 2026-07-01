import{useEffect,useState}from'react';
import{Link}from'react-router-dom';
import api from'../utils/api';
 
const ST={
  pending:  {color:'#FBBF24',bg:'rgba(251,191,36,.12)', icon:'⏳',label:'Pending',   step:0},
  processing:{color:'#60A5FA',bg:'rgba(96,165,250,.12)',icon:'⚙️',label:'Processing',step:1},
  shipped:  {color:'#A78BFA',bg:'rgba(167,139,250,.12)',icon:'🚚',label:'Shipped',   step:2},
  delivered:{color:'#34D399',bg:'rgba(52,211,153,.12)', icon:'✅',label:'Delivered', step:3},
  cancelled:{color:'#F87171',bg:'rgba(248,113,113,.12)',icon:'❌',label:'Cancelled', step:-1},
};
 
const PAY_ICONS={card:'💳',upi:'📱',netbank:'🏦',wallet:'👛',cod:'💵',emi:'📅',stripe:'💳',paypal:'🅿️'};
 
export default function Orders(){
  const[orders,setOrders]=useState([]);
  const[loading,setLoading]=useState(true);
  const[filter,setFilter]=useState('all');
  const[search,setSearch]=useState('');
  const[expanded,setExpanded]=useState(null);
 
  useEffect(()=>{
    api.get('/orders/mine').then(r=>setOrders(r.data||[])).catch(()=>setOrders([])).finally(()=>setLoading(false));
  },[]);
 
  const filtered=orders.filter(o=>{
    const mF=filter==='all'||o.status===filter;
    const mS=!search||o._id.includes(search)||o.orderItems?.some(i=>i.name?.toLowerCase().includes(search.toLowerCase()));
    return mF&&mS;
  });
 
  const stats=[
    {label:'Total Orders',val:orders.length,icon:'📦',color:'var(--p)'},
    {label:'Delivered',   val:orders.filter(o=>o.status==='delivered').length,icon:'✅',color:'var(--green)'},
    {label:'In Transit',  val:orders.filter(o=>['shipped','processing'].includes(o.status)).length,icon:'🚚',color:'#60A5FA'},
    {label:'Total Spent', val:'$'+orders.reduce((s,o)=>s+(o.totalPrice||0),0).toFixed(0),icon:'💰',color:'var(--gold)'},
  ];
 
  const STEPS=['pending','processing','shipped','delivered'];
 
  return(
    <div style={{background:'var(--bg)',minHeight:'100vh',paddingBottom:'6rem'}}>
      {/* Animated Header */}
      <div style={S.hdr}>
        <div style={S.hdrGrid}/>
        <div style={S.hdrBlob}/>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
            <div style={S.hdrIcon}>📦</div>
            <div>
              <h1 style={S.title}>My Orders</h1>
              <p style={{color:'var(--text2)',fontSize:'.88rem',marginTop:'2px'}}>Track, manage and review all your purchases</p>
            </div>
          </div>
        </div>
      </div>
 
      <div className="container" style={{marginTop:'2rem'}}>
        {/* Stats */}
        <div style={S.statsRow}>
          {stats.map((s,i)=>(
            <div key={s.label} style={{...S.statCard,animationDelay:`${i*.07}s`}} className="fade-up">
              <div style={{fontSize:'2rem',marginBottom:'8px'}}>{s.icon}</div>
              <div style={{fontFamily:'var(--display)',fontSize:'1.7rem',fontWeight:800,color:s.color,lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:'.76rem',color:'var(--text2)',marginTop:'4px',fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>
 
        {/* Toolbar */}
        <div style={S.toolbar}>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {['all','pending','processing','shipped','delivered','cancelled'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{...S.fTab,...(filter===f?S.fTabA:{})}}>
                {f==='all'?'🗂 All':ST[f]?.icon+' '+ST[f]?.label}
              </button>
            ))}
          </div>
          <div style={S.searchBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by order ID or product..." style={S.searchInp}/>
          </div>
        </div>
 
        {/* Orders */}
        {loading?(
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            {[1,2,3].map(i=><div key={i} style={{background:'var(--card)',borderRadius:'var(--r2)',border:'1px solid var(--border)',overflow:'hidden'}}><div className="skeleton" style={{height:'140px'}}/></div>)}
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:'center',padding:'6rem 2rem'}}>
            <div style={{fontSize:'5rem',marginBottom:'1rem'}}>📭</div>
            <h3 style={{fontFamily:'var(--display)',fontSize:'1.4rem',fontWeight:700,marginBottom:'8px'}}>
              {filter==='all'&&!search?'No orders yet':'No matching orders'}
            </h3>
            <p style={{color:'var(--text2)',marginBottom:'2rem'}}>
              {filter==='all'&&!search?'Your order history will appear here':'Try a different filter or search term'}
            </p>
            <Link to="/products" style={{background:'var(--grad)',color:'#fff',padding:'13px 28px',borderRadius:'11px',fontWeight:700,fontSize:'.9rem',boxShadow:'0 4px 16px var(--pglow)'}}>
              Start Shopping →
            </Link>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            {filtered.map((order,oi)=>{
              const cfg=ST[order.status]||ST.pending;
              const date=new Date(order.createdAt).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'});
              const curStep=cfg.step;
              const isExp=expanded===order._id;
              return(
                <div key={order._id} style={{...S.orderCard,animation:`fadeUp .4s ease ${oi*.06}s both`,border:`1px solid ${isExp?'rgba(124,111,255,.3)':'var(--border)'}`}}>
                  {/* Top Bar */}
                  <div style={S.orderTop}>
                    <div style={{display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
                      <div>
                        <div style={S.metaLbl}>Order ID</div>
                        <div style={{fontFamily:'var(--display)',fontWeight:700,fontSize:'.92rem',color:'var(--p2)',letterSpacing:'.03em'}}>
                          #{order._id.slice(-10).toUpperCase()}
                        </div>
                      </div>
                      <div style={S.divider}/>
                      <div>
                        <div style={S.metaLbl}>Placed</div>
                        <div style={{fontSize:'.86rem',fontWeight:500}}>{date}</div>
                      </div>
                      <div style={S.divider}/>
                      <div>
                        <div style={S.metaLbl}>Items</div>
                        <div style={{fontSize:'.86rem',fontWeight:500}}>{order.orderItems?.length||0} item{order.orderItems?.length!==1?'s':''}</div>
                      </div>
                      <div style={S.divider}/>
                      <div>
                        <div style={S.metaLbl}>Payment</div>
                        <div style={{fontSize:'.86rem',fontWeight:500}}>{PAY_ICONS[order.paymentMethod]||'💳'} {order.paymentMethod?.toUpperCase()||'CARD'}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
                      <span style={{...S.badge,background:cfg.bg,color:cfg.color,borderColor:cfg.color+'55'}}>{cfg.icon} {cfg.label}</span>
                      <span style={{fontFamily:'var(--display)',fontSize:'1.15rem',fontWeight:800}}>${order.totalPrice?.toFixed(2)}</span>
                    </div>
                  </div>
 
                  {/* Step Tracker */}
                  {order.status!=='cancelled'&&(
                    <div style={S.tracker}>
                      <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'14px'}}>Order Progress</div>
                      <div style={{display:'flex',alignItems:'flex-start'}}>
                        {STEPS.map((step,si)=>{
                          const sc=ST[step];
                          const done=curStep>si;
                          const active=curStep===si;
                          return(
                            <div key={step} style={{display:'flex',alignItems:'center',flex:1}}>
                              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'7px',position:'relative',zIndex:1}}>
                                <div style={{
                                  width:'38px',height:'38px',borderRadius:'50%',
                                  display:'flex',alignItems:'center',justifyContent:'center',
                                  background:done?'var(--grad)':active?'var(--grad)':'var(--card2)',
                                  border:`2px solid ${done||active?'var(--p)':'var(--border)'}`,
                                  boxShadow:active?'0 0 0 5px var(--pglow),0 0 20px var(--pglow)':'none',
                                  fontSize:'.85rem',fontWeight:700,color:'#fff',
                                  transition:'all .4s ease',
                                  animation:active?'glow 2s ease-in-out infinite':'none',
                                }}>
                                  {done?'✓':active?sc.icon:si+1}
                                </div>
                                <span style={{fontSize:'.68rem',fontWeight:600,color:done||active?'var(--text)':'var(--text3)',whiteSpace:'nowrap'}}>{sc.label}</span>
                                {active&&<span style={{fontSize:'.62rem',color:'var(--p2)',fontWeight:600,animation:'pulse 1.5s ease infinite'}}>● Now</span>}
                              </div>
                              {si<STEPS.length-1&&(
                                <div style={{flex:1,height:'3px',margin:'0 4px',marginBottom:'22px',borderRadius:'2px',background:done?'var(--p)':'var(--border)',position:'relative',overflow:'hidden',transition:'background .4s ease'}}>
                                  {done&&<div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,var(--p),var(--pink))',borderRadius:'2px'}}/>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
 
                  {/* Product Previews */}
                  <div style={S.itemsRow}>
                    {(order.orderItems||[]).slice(0,3).map((item,ii)=>(
                      <div key={ii} style={{display:'flex',alignItems:'center',gap:'10px',flex:1,minWidth:'180px'}}>
                        <div style={{width:'50px',height:'50px',borderRadius:'9px',overflow:'hidden',flexShrink:0,background:'var(--bg3)',border:'1px solid var(--border)'}}>
                          <img src={item.image||`https://placehold.co/50x50/13131F/7C6FFF?text=P`} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:'.82rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'140px'}}>{item.name}</div>
                          <div style={{fontSize:'.74rem',color:'var(--text2)',marginTop:'2px'}}>Qty: {item.quantity} · ${item.price?.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    {(order.orderItems||[]).length>3&&(
                      <div style={{background:'var(--card2)',borderRadius:'9px',padding:'8px 14px',fontSize:'.78rem',fontWeight:700,color:'var(--text2)',border:'1px solid var(--border)'}}>
                        +{order.orderItems.length-3} more
                      </div>
                    )}
                  </div>
 
                  {/* Expanded Details */}
                  {isExp&&(
                    <div style={{padding:'1rem 1.3rem',borderTop:'1px solid var(--border)',background:'rgba(124,111,255,.02)',animation:'fadeUp .3s ease'}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',flexWrap:'wrap'}}>
                        {order.shippingAddress&&(
                          <div>
                            <div style={{fontSize:'.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text2)',marginBottom:'8px'}}>📍 Shipping Address</div>
                            <div style={{fontSize:'.85rem',lineHeight:'1.7',color:'var(--text)',background:'var(--card2)',borderRadius:'9px',padding:'10px 14px',border:'1px solid var(--border)'}}>
                              {order.shippingAddress.name&&<div style={{fontWeight:600}}>{order.shippingAddress.name}</div>}
                              <div>{order.shippingAddress.street}</div>
                              <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                              <div>{order.shippingAddress.country}</div>
                              {order.shippingAddress.phone&&<div style={{color:'var(--text2)',marginTop:'4px'}}>📞 {order.shippingAddress.phone}</div>}
                            </div>
                          </div>
                        )}
                        <div>
                          <div style={{fontSize:'.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text2)',marginBottom:'8px'}}>💰 Price Breakdown</div>
                          <div style={{background:'var(--card2)',borderRadius:'9px',padding:'10px 14px',border:'1px solid var(--border)'}}>
                            {[['Subtotal',`$${order.itemsPrice?.toFixed(2)||'—'}`],['Shipping',order.shippingPrice===0?'FREE':`$${order.shippingPrice?.toFixed(2)||'—'}`],['Tax',`$${order.taxPrice?.toFixed(2)||'—'}`]].map(([l,v])=>(
                              <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:'.84rem',marginBottom:'6px',color:'var(--text2)'}}>
                                <span>{l}</span><span style={{color:v==='FREE'?'var(--green)':undefined,fontWeight:v==='FREE'?600:400}}>{v}</span>
                              </div>
                            ))}
                            <div style={{borderTop:'1px solid var(--border)',marginTop:'8px',paddingTop:'8px',display:'flex',justifyContent:'space-between',fontWeight:700,fontFamily:'var(--display)',fontSize:'.95rem'}}>
                              <span>Total</span><span>${order.totalPrice?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
 
                  {/* Footer */}
                  <div style={S.orderFooter}>
                    <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                      <span style={{fontSize:'.76rem',color:order.isPaid?'var(--green)':'var(--gold)',fontWeight:600,background:order.isPaid?'rgba(52,211,153,.1)':'rgba(251,191,36,.1)',padding:'3px 9px',borderRadius:'20px',border:`1px solid ${order.isPaid?'rgba(52,211,153,.25)':'rgba(251,191,36,.25)'}`}}>
                        {order.isPaid?`✅ Paid`:'⏳ Payment Pending'}
                      </span>
                      {order.isDelivered&&(
                        <span style={{fontSize:'.76rem',color:'var(--green)',fontWeight:500}}>
                          · Delivered {new Date(order.deliveredAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                      <button onClick={()=>setExpanded(isExp?null:order._id)} style={S.expandBtn}>
                        {isExp?'▲ Less':'▼ Details'}
                      </button>
                      <Link to={`/orders/${order._id}`} style={S.viewBtn}>View Full Details →</Link>
                      {order.status==='delivered'&&(
                        <button style={S.reviewBtn}>★ Write Review</button>
                      )}
                      {order.status==='pending'&&(
                        <button style={S.cancelBtn}>✕ Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 5px var(--pglow)}50%{box-shadow:0 0 0 8px rgba(124,111,255,.35)}}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        .fade-up{animation:fadeUp .45s ease both}
      `}</style>
    </div>
  );
}
 
const S={
  hdr:{background:'linear-gradient(135deg,var(--bg2),var(--bg))',padding:'3rem 0 2.5rem',borderBottom:'1px solid var(--border)',position:'relative',overflow:'hidden'},
  hdrGrid:{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(124,111,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,111,255,.05) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'},
  hdrBlob:{position:'absolute',width:'400px',height:'400px',borderRadius:'50%',background:'var(--grad)',filter:'blur(100px)',opacity:.06,top:'-100px',right:'-50px',pointerEvents:'none'},
  hdrIcon:{width:'52px',height:'52px',background:'var(--grad)',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',flexShrink:0,boxShadow:'0 4px 16px var(--pglow)'},
  title:{fontFamily:'var(--display)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:800},
  statsRow:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'2rem'},
  statCard:{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r2)',padding:'1.4rem',textAlign:'center',transition:'all .2s ease',cursor:'default'},
  toolbar:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',gap:'1rem',flexWrap:'wrap'},
  fTab:{padding:'7px 14px',borderRadius:'20px',border:'1px solid var(--border)',background:'none',color:'var(--text2)',fontSize:'.76rem',fontWeight:600,cursor:'pointer',transition:'var(--t)',whiteSpace:'nowrap'},
  fTabA:{background:'var(--grad)',color:'#fff',border:'none',boxShadow:'0 4px 12px var(--pglow)'},
  searchBox:{display:'flex',alignItems:'center',gap:'8px',background:'var(--card)',border:'1.5px solid var(--border)',borderRadius:'10px',padding:'9px 14px',minWidth:'240px'},
  searchInp:{background:'none',border:'none',outline:'none',color:'var(--text)',fontSize:'.86rem',flex:1},
  orderCard:{background:'var(--card)',borderRadius:'var(--r2)',overflow:'hidden',transition:'all .2s ease'},
  orderTop:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 1.3rem',borderBottom:'1px solid var(--border)',flexWrap:'wrap',gap:'10px',background:'rgba(124,111,255,.03)'},
  metaLbl:{fontSize:'.66rem',color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'3px'},
  divider:{width:'1px',height:'36px',background:'var(--border)'},
  badge:{display:'inline-flex',alignItems:'center',gap:'5px',padding:'5px 12px',borderRadius:'20px',fontSize:'.74rem',fontWeight:700,border:'1px solid'},
  tracker:{padding:'1.2rem 1.5rem',background:'rgba(124,111,255,.02)',borderBottom:'1px solid var(--border)'},
  itemsRow:{display:'flex',alignItems:'center',gap:'12px',padding:'1rem 1.3rem',borderBottom:'1px solid var(--border)',flexWrap:'wrap'},
  orderFooter:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.9rem 1.3rem',flexWrap:'wrap',gap:'8px'},
  expandBtn:{background:'var(--card2)',color:'var(--text2)',border:'1px solid var(--border)',padding:'7px 14px',borderRadius:'8px',fontSize:'.76rem',fontWeight:600,cursor:'pointer',transition:'var(--t)'},
  viewBtn:{background:'var(--grad)',color:'#fff',padding:'8px 18px',borderRadius:'8px',fontSize:'.78rem',fontWeight:700,boxShadow:'0 4px 12px var(--pglow)'},
  reviewBtn:{background:'rgba(251,191,36,.1)',color:'var(--gold)',border:'1px solid rgba(251,191,36,.25)',padding:'8px 16px',borderRadius:'8px',fontSize:'.78rem',fontWeight:700,cursor:'pointer'},
  cancelBtn:{background:'rgba(248,113,113,.08)',color:'var(--red)',border:'1px solid rgba(248,113,113,.25)',padding:'8px 14px',borderRadius:'8px',fontSize:'.76rem',fontWeight:600,cursor:'pointer'},
};
 