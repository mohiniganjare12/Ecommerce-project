import{useState}from'react';
import{Link,useNavigate}from'react-router-dom';
import{useAuth}from'../context/AuthContext';
import{toast}from'react-toastify';
export default function Register(){
  const[form,setForm]=useState({name:'',email:'',password:'',confirm:''});
  const[loading,setLoading]=useState(false);
  const{register}=useAuth();const nav=useNavigate();
  const submit=async e=>{
    e.preventDefault();
    if(form.password!==form.confirm){toast.error('Passwords do not match');return;}
    if(form.password.length<6){toast.error('Min 6 characters');return;}
    setLoading(true);
    try{await register(form.name,form.email,form.password);toast.success('Welcome! 🎉');nav('/');}
    catch(err){toast.error(err.response?.data?.message||'Failed');}
    finally{setLoading(false);}
  };
  const str=(()=>{const p=form.password;if(!p)return 0;let s=0;if(p.length>=6)s++;if(p.length>=10)s++;if(/[A-Z]/.test(p))s++;if(/[0-9]/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return s;})();
  const sc=['','#F87171','#FBBF24','#FBBF24','#34D399','#34D399'][str];
  const sl=['','Weak','Fair','Good','Strong','Very Strong'][str];
  return(
    <div style={S.page}>
      <div style={S.b1}/><div style={S.b2}/><div style={S.grid}/>
      <div style={S.card}>
        <Link to="/" style={S.logo}>
          <div style={S.logoBox}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
          <span style={{fontFamily:'var(--display)',fontWeight:800,fontSize:'1rem'}}>NEXUS<span style={{color:'var(--p)'}}>SHOP</span></span>
        </Link>
        <h1 style={S.title}>Create Account</h1>
        <p style={S.sub}>Join thousands of happy shoppers</p>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {[{k:'name',l:'Full Name',t:'text',ph:'John Doe',ic:'👤'},{k:'email',l:'Email',t:'email',ph:'you@example.com',ic:'✉️'}].map(f=>(
            <div key={f.k}>
              <label style={S.lbl}>{f.l}</label>
              <div style={S.iRow}><span>{f.ic}</span><input type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.ph} required style={S.inp}/></div>
            </div>
          ))}
          <div>
            <label style={S.lbl}>Password</label>
            <div style={S.iRow}><span>🔒</span><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min. 6 chars" required style={S.inp}/></div>
            {form.password&&<div style={{marginTop:'7px'}}><div style={{display:'flex',gap:'3px',marginBottom:'3px'}}>{[1,2,3,4,5].map(i=><div key={i} style={{flex:1,height:'3px',borderRadius:'2px',background:i<=str?sc:'var(--border)',transition:'var(--t)'}}/>)}</div><span style={{fontSize:'.7rem',color:sc,fontWeight:600}}>{sl}</span></div>}
          </div>
          <div>
            <label style={S.lbl}>Confirm Password</label>
            <div style={{...S.iRow,...(form.confirm&&form.confirm!==form.password?{borderColor:'var(--red)'}:{})}}>
              <span>🔒</span><input type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} placeholder="Repeat" required style={S.inp}/>
              {form.confirm&&<span style={{fontSize:'.88rem'}}>{form.confirm===form.password?'✅':'❌'}</span>}
            </div>
          </div>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading?<span style={S.spin}/>:'Create Account →'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1.5rem',fontSize:'.86rem',color:'var(--text2)'}}>
          Have account? <Link to="/login" style={{color:'var(--p)',fontWeight:700}}>Sign in →</Link>
        </p>
      </div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}'}</style>
    </div>
  );
}
const S={
  page:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',position:'relative',overflow:'hidden'},
  b1:{position:'absolute',width:'400px',height:'400px',borderRadius:'50%',background:'var(--p)',filter:'blur(100px)',opacity:.1,top:'-80px',right:'-80px',pointerEvents:'none'},
  b2:{position:'absolute',width:'320px',height:'320px',borderRadius:'50%',background:'var(--cyan)',filter:'blur(80px)',opacity:.07,bottom:'-60px',left:'-60px',pointerEvents:'none'},
  grid:{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(124,111,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,111,255,.04) 1px,transparent 1px)',backgroundSize:'50px 50px',pointerEvents:'none'},
  card:{width:'100%',maxWidth:'430px',background:'var(--card)',border:'1px solid var(--border2)',borderRadius:'var(--r3)',padding:'2.5rem',boxShadow:'var(--shadow2)',position:'relative',zIndex:1,animation:'fadeUp .4s ease'},
  logo:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2rem'},
  logoBox:{width:'30px',height:'30px',background:'var(--grad)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'},
  title:{fontFamily:'var(--display)',fontSize:'1.75rem',fontWeight:700,marginBottom:'5px'},
  sub:{color:'var(--text2)',fontSize:'.88rem',marginBottom:'2rem'},
  lbl:{display:'block',fontSize:'.8rem',fontWeight:600,color:'var(--text2)',marginBottom:'6px'},
  iRow:{display:'flex',alignItems:'center',gap:'9px',background:'var(--bg2)',border:'1.5px solid var(--border)',borderRadius:'10px',padding:'0 13px',transition:'var(--t)'},
  inp:{flex:1,background:'none',border:'none',outline:'none',padding:'12px 0',fontSize:'.9rem',color:'var(--text)'},
  btn:{width:'100%',padding:'13px',background:'var(--grad)',color:'#fff',border:'none',borderRadius:'10px',fontSize:'.95rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 4px 18px var(--pglow)',transition:'var(--t)',marginTop:'.3rem'},
  spin:{width:'18px',height:'18px',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'},
};
