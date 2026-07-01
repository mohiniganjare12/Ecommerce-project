import{useState}from'react';
import{Link,useNavigate}from'react-router-dom';
import{useAuth}from'../context/AuthContext';
import{toast}from'react-toastify';
export default function Login(){
  const[form,setForm]=useState({email:'',password:''});
  const[loading,setLoading]=useState(false);
  const[show,setShow]=useState(false);
  const{login}=useAuth();const nav=useNavigate();
  const submit=async e=>{
    e.preventDefault();setLoading(true);
    try{await login(form.email,form.password);toast.success('Welcome back! 👋');nav('/');}
    catch(err){toast.error(err.response?.data?.message||'Invalid credentials');}
    finally{setLoading(false);}
  };
  return(
    <div style={S.page}>
      <div style={S.b1}/><div style={S.b2}/><div style={S.grid}/>
      <div style={S.card}>
        <Link to="/" style={S.logo}>
          <div style={S.logoBox}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
          <span style={{fontFamily:'var(--display)',fontWeight:800,fontSize:'1rem'}}>NEXUS<span style={{color:'var(--p)'}}>SHOP</span></span>
        </Link>
        <h1 style={S.title}>Welcome back</h1>
        <p style={S.sub}>Sign in to continue shopping</p>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div>
            <label style={S.lbl}>Email</label>
            <div style={S.iRow}><span>✉️</span><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required style={S.inp}/></div>
          </div>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}><label style={S.lbl}>Password</label><span style={{fontSize:'.78rem',color:'var(--p)',cursor:'pointer'}}>Forgot?</span></div>
            <div style={S.iRow}><span>🔒</span><input type={show?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required style={S.inp}/><button type="button" onClick={()=>setShow(!show)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'.88rem'}}>{show?'🙈':'👁️'}</button></div>
          </div>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading?<span style={S.spin}/>:'Sign In →'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1.5rem',fontSize:'.86rem',color:'var(--text2)'}}>
          No account? <Link to="/register" style={{color:'var(--p)',fontWeight:700}}>Create one free →</Link>
        </p>
      </div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}
const S={
  page:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',position:'relative',overflow:'hidden'},
  b1:{position:'absolute',width:'420px',height:'420px',borderRadius:'50%',background:'var(--p)',filter:'blur(100px)',opacity:.1,top:'-100px',left:'-100px',pointerEvents:'none'},
  b2:{position:'absolute',width:'360px',height:'360px',borderRadius:'50%',background:'var(--pink)',filter:'blur(90px)',opacity:.07,bottom:'-80px',right:'-80px',pointerEvents:'none'},
  grid:{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(124,111,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,111,255,.04) 1px,transparent 1px)',backgroundSize:'50px 50px',pointerEvents:'none'},
  card:{width:'100%',maxWidth:'420px',background:'var(--card)',border:'1px solid var(--border2)',borderRadius:'var(--r3)',padding:'2.5rem',boxShadow:'var(--shadow2)',position:'relative',zIndex:1,animation:'fadeUp .4s ease'},
  logo:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2rem',fontFamily:'var(--display)'},
  logoBox:{width:'30px',height:'30px',background:'var(--grad)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'},
  title:{fontFamily:'var(--display)',fontSize:'1.75rem',fontWeight:700,marginBottom:'5px'},
  sub:{color:'var(--text2)',fontSize:'.88rem',marginBottom:'2rem'},
  lbl:{display:'block',fontSize:'.8rem',fontWeight:600,color:'var(--text2)',marginBottom:'6px'},
  iRow:{display:'flex',alignItems:'center',gap:'9px',background:'var(--bg2)',border:'1.5px solid var(--border)',borderRadius:'10px',padding:'0 13px',transition:'var(--t)'},
  inp:{flex:1,background:'none',border:'none',outline:'none',padding:'12px 0',fontSize:'.9rem',color:'var(--text)'},
  btn:{width:'100%',padding:'13px',background:'var(--grad)',color:'#fff',border:'none',borderRadius:'10px',fontSize:'.95rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 4px 18px var(--pglow)',transition:'var(--t)'},
  spin:{width:'18px',height:'18px',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'},
};
