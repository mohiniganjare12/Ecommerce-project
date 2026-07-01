import{BrowserRouter,Routes,Route,Navigate}from'react-router-dom';
import{ToastContainer}from'react-toastify';
import'react-toastify/dist/ReactToastify.css';
import'./index.css';
import{AuthProvider,useAuth}from'./context/AuthContext';
import{CartProvider}from'./context/CartContext';
import Navbar from'./components/Navbar';
import AIChatBot from'./components/ai/AIChatBot';
import Home from'./pages/Home';
import Products from'./pages/Products';
import ProductDetail from'./pages/ProductDetail';
import Cart from'./pages/Cart';
import Checkout from'./pages/Checkout';
import Login from'./pages/Login';
import Register from'./pages/Register';
import Profile from'./pages/Profile';
import Orders from'./pages/Orders';
import OrderDetail from'./pages/OrderDetail';
import Wishlist from'./pages/Wishlist';
import AdminDashboard from'./pages/admin/Dashboard';
import AdminProducts from'./pages/admin/Products';
import AdminOrders from'./pages/admin/Orders';
import AdminUsers from'./pages/admin/Users';
 
const PR=({children})=>{const{user,loading}=useAuth();if(loading)return<Spin/>;return user?children:<Navigate to="/login"/>;};
const AR=({children})=>{const{user,loading}=useAuth();if(loading)return null;return user?.role==='admin'?children:<Navigate to="/"/>;};
const Spin=()=><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><div style={{width:'36px',height:'36px',border:'3px solid var(--border)',borderTopColor:'var(--p)',borderRadius:'50%',animation:'spin .7s linear infinite'}}/><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></div>;
 
function Footer(){
  return(
    <footer style={{background:'var(--bg2)',borderTop:'1px solid var(--border)'}}>
      {/* Main Footer */}
      <div style={{padding:'4rem 0 3rem'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'1.8fr 1fr 1fr 1fr',gap:'3rem',marginBottom:'3rem'}}>
            {/* Brand */}
            <div>
              <div style={{fontFamily:'var(--display)',fontWeight:800,fontSize:'1.1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'30px',height:'30px',background:'var(--grad)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </div>
                NEXUS<span style={{color:'var(--p)'}}>SHOP</span>
              </div>
              <p style={{color:'var(--text2)',fontSize:'.84rem',lineHeight:'1.75',marginBottom:'1.4rem'}}>
                A full-stack AI-powered e-commerce platform built with React, Node.js, MongoDB and Gemini AI. Designed for the modern shopping experience.
              </p>
              {/* Tech Stack Badges */}
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'1.4rem'}}>
                {['React','Node.js','MongoDB','Express','Gemini AI','JWT'].map(t=>(
                  <span key={t} style={{fontSize:'.68rem',background:'rgba(124,111,255,.1)',border:'1px solid rgba(124,111,255,.2)',borderRadius:'5px',padding:'3px 8px',color:'var(--p2)',fontWeight:600}}>{t}</span>
                ))}
              </div>
            </div>
 
            {/* Quick Links */}
            <div>
              <div style={{fontWeight:700,fontSize:'.78rem',textTransform:'uppercase',letterSpacing:'.1em',color:'var(--text2)',marginBottom:'1.2rem'}}>Shop</div>
              {['All Products','Electronics','Fashion','Home & Living','Sports','Books','Beauty'].map(l=>(
                <div key={l} style={{color:'var(--text3)',fontSize:'.84rem',marginBottom:'8px',cursor:'pointer',transition:'var(--t)'}}>{l}</div>
              ))}
            </div>
 
            {/* Account */}
            <div>
              <div style={{fontWeight:700,fontSize:'.78rem',textTransform:'uppercase',letterSpacing:'.1em',color:'var(--text2)',marginBottom:'1.2rem'}}>Account</div>
              {['Sign In','Create Account','My Orders','Wishlist','Profile Settings','Admin Panel'].map(l=>(
                <div key={l} style={{color:'var(--text3)',fontSize:'.84rem',marginBottom:'8px',cursor:'pointer',transition:'var(--t)'}}>{l}</div>
              ))}
            </div>
 
            {/* Contact */}
            <div>
              <div style={{fontWeight:700,fontSize:'.78rem',textTransform:'uppercase',letterSpacing:'.1em',color:'var(--text2)',marginBottom:'1.2rem'}}>Contact</div>
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {[
                  {icon:'✉️', label:'Email', val:'mohiniganjare44@gmail.com', link:'mailto:mohiniganjare44@gmail.com'},
                  {icon:'💼', label:'LinkedIn', val:'linkedin.com/in/mohini-ganjare', link:'https://linkedin.com/in/mohini-ganjare'},
                  {icon:'🐙', label:'GitHub', val:'github.com/mohini-ganjare', link:'https://github.com/mohini-ganjare'},
                ].map(c=>(
                  <a key={c.label} href={c.link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'flex-start',gap:'10px',textDecoration:'none',transition:'var(--t)'}}>
                    <span style={{fontSize:'1rem',flexShrink:0,marginTop:'1px'}}>{c.icon}</span>
                    <div>
                      <div style={{fontSize:'.7rem',color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>{c.label}</div>
                      <div style={{fontSize:'.8rem',color:'var(--text2)',marginTop:'1px',wordBreak:'break-all'}}>{c.val}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
 
          {/* Contact Section Banner */}
          <div style={{background:'linear-gradient(135deg,rgba(124,111,255,.1),rgba(255,107,157,.08))',border:'1px solid rgba(124,111,255,.2)',borderRadius:'var(--r2)',padding:'1.8rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1.5rem',marginBottom:'3rem'}}>
            <div>
              <h3 style={{fontFamily:'var(--display)',fontSize:'1.1rem',fontWeight:700,marginBottom:'6px'}}>👋 Let's Connect!</h3>
              <p style={{color:'var(--text2)',fontSize:'.84rem',lineHeight:'1.6',maxWidth:'400px'}}>
                I'm <strong style={{color:'var(--text)'}}>Mohini Ganjare</strong>, a full-stack developer. This project is part of my portfolio. Open to internships and job opportunities!
              </p>
              <div style={{display:'flex',gap:'12px',marginTop:'12px',flexWrap:'wrap'}}>
                {[{label:'📧 Email Me',href:'mailto:mohiniganjare44@gmail.com',grad:'var(--grad)'},{label:'💼 LinkedIn',href:'https://linkedin.com',grad:'linear-gradient(135deg,#0077B5,#00A0DC)'},{label:'🐙 GitHub',href:'https://github.com',grad:'linear-gradient(135deg,#24292e,#40464e)'}].map(b=>(
                  <a key={b.label} href={b.href} target="_blank" rel="noreferrer"
                    style={{display:'inline-flex',alignItems:'center',gap:'6px',background:b.grad,color:'#fff',padding:'8px 18px',borderRadius:'9px',fontSize:'.78rem',fontWeight:700,textDecoration:'none',boxShadow:'0 4px 14px rgba(0,0,0,.3)'}}>
                    {b.label}
                  </a>
                ))}
              </div>
            </div>
            <div style={{textAlign:'center',flexShrink:0}}>
              <div style={{width:'72px',height:'72px',background:'var(--grad)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',margin:'0 auto 8px',boxShadow:'0 0 30px var(--pglow)'}}>👩‍💻</div>
              <div style={{fontFamily:'var(--display)',fontWeight:700,fontSize:'.9rem'}}>Mohini Ganjare</div>
              <div style={{fontSize:'.75rem',color:'var(--text2)',marginTop:'2px'}}>Full-Stack Developer</div>
            </div>
          </div>
 
          {/* Payment Methods */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem',paddingBottom:'2rem',borderBottom:'1px solid var(--border)'}}>
            <div>
              <div style={{fontSize:'.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text3)',marginBottom:'8px'}}>Accepted Payments</div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {['💳 Visa','💳 Mastercard','📱 UPI','🏦 Net Banking','💵 COD','📅 EMI','👛 Wallet'].map(p=>(
                  <span key={p} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'6px',padding:'4px 10px',fontSize:'.72rem',color:'var(--text2)',fontWeight:500}}>{p}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:'.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text3)',marginBottom:'8px'}}>Secured By</div>
              <div style={{display:'flex',gap:'8px'}}>
                {['🔒 SSL','⚡ Stripe','🛡️ JWT Auth'].map(s=>(
                  <span key={s} style={{background:'rgba(52,211,153,.08)',border:'1px solid rgba(52,211,153,.2)',borderRadius:'6px',padding:'4px 10px',fontSize:'.72rem',color:'var(--green)',fontWeight:600}}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Bottom Bar */}
      <div style={{borderTop:'1px solid var(--border)',padding:'1.2rem 0'}}>
        <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
          <span style={{color:'var(--text3)',fontSize:'.76rem'}}>© 2025 NexusShop · Built by <strong style={{color:'var(--p2)'}}>Mohini Ganjare</strong> · MERN Stack + AI Portfolio Project</span>
          <div style={{display:'flex',gap:'1.2rem'}}>
            {['Privacy Policy','Terms of Service','Sitemap'].map(l=>(
              <span key={l} style={{color:'var(--text3)',fontSize:'.74rem',cursor:'pointer',transition:'var(--t)'}}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
 
export default function App(){
  return(
    <AuthProvider><CartProvider>
      <BrowserRouter>
        <div className="page-wrapper">
          <Navbar/>
          <main>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/products" element={<Products/>}/>
              <Route path="/products/:id" element={<ProductDetail/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/cart" element={<PR><Cart/></PR>}/>
              <Route path="/checkout" element={<PR><Checkout/></PR>}/>
              <Route path="/profile" element={<PR><Profile/></PR>}/>
              <Route path="/orders" element={<PR><Orders/></PR>}/>
              <Route path="/orders/:id" element={<PR><OrderDetail/></PR>}/>
              <Route path="/wishlist" element={<PR><Wishlist/></PR>}/>
              <Route path="/admin" element={<AR><AdminDashboard/></AR>}/>
              <Route path="/admin/products" element={<AR><AdminProducts/></AR>}/>
              <Route path="/admin/orders" element={<AR><AdminOrders/></AR>}/>
              <Route path="/admin/users" element={<AR><AdminUsers/></AR>}/>
              <Route path="*" element={<Navigate to="/"/>}/>
            </Routes>
          </main>
          <Footer/>
          <AIChatBot/>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000}
          toastStyle={{background:'var(--card)',color:'var(--text)',border:'1px solid var(--border2)',borderRadius:'12px',fontFamily:'var(--font)',fontSize:'.86rem'}}/>
      </BrowserRouter>
    </CartProvider></AuthProvider>
  );
}