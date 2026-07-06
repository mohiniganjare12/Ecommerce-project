import{useEffect,useState,useRef}from'react';
import api from'../../utils/api';

export default function AdminProducts(){
  const[products,setProducts]=useState([]);
  const[form,setForm]=useState({name:'',price:'',comparePrice:'',category:'',stock:'',description:'',imageUrl:'',brand:'',isFeatured:false});
  const[showForm,setShowForm]=useState(false);
  const[editId,setEditId]=useState(null);
  const[loading,setLoading]=useState(false);
  const[msg,setMsg]=useState('');
  const formRef=useRef(null);

  useEffect(()=>{
    api.get('/products?limit=200').then(r=>setProducts(r.data.products||[])).catch(()=>{});
  },[]);

  const handleSubmit=async(e)=>{
    e.preventDefault();
    setLoading(true);setMsg('');
    try{
      const payload={
        name:form.name,
        price:Number(form.price),
        comparePrice:Number(form.comparePrice)||Number(form.price),
        category:form.category,
        stock:Number(form.stock),
        description:form.description,
        brand:form.brand||'',
        isFeatured:form.isFeatured,
        isActive:true,
        images:form.imageUrl?[{url:form.imageUrl}]:[],
      };
      if(editId){
        const{data}=await api.put(`/products/${editId}`,payload);
        setProducts(p=>p.map(x=>x._id===editId?data:x));
        setMsg('✅ Product updated successfully!');
      }else{
        const{data}=await api.post('/products',payload);
        setProducts(p=>[data,...p]);
        setMsg('✅ Product created successfully!');
      }
      setForm({name:'',price:'',comparePrice:'',category:'',stock:'',description:'',imageUrl:'',brand:'',isFeatured:false});
      setShowForm(false);setEditId(null);
    }catch(err){
      setMsg('❌ Failed: '+(err.response?.data?.message||err.message));
    }finally{setLoading(false);}
  };

  const handleDelete=async(id)=>{
    if(!window.confirm('Delete this product?'))return;
    try{
      await api.delete(`/products/${id}`);
      setProducts(p=>p.filter(x=>x._id!==id));
      setMsg('✅ Product deleted');
    }catch{setMsg('❌ Delete failed');}
  };

  const handleEdit=(p)=>{
    setForm({
      name:p.name||'',
      price:p.price||'',
      comparePrice:p.comparePrice||'',
      category:p.category||'',
      stock:p.stock||'',
      description:p.description||'',
      imageUrl:p.images?.[0]?.url||'',
      brand:p.brand||'',
      isFeatured:p.isFeatured||false,
    });
    setEditId(p._id);
    setShowForm(true);
    // Scroll to form
    setTimeout(()=>formRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),100);
  };

  const openAdd=()=>{
    setForm({name:'',price:'',comparePrice:'',category:'',stock:'',description:'',imageUrl:'',brand:'',isFeatured:false});
    setEditId(null);
    setShowForm(true);
    setTimeout(()=>formRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),100);
  };

  const cats=['Electronics','Fashion','Home','Sports','Books','Beauty','Health','Toys','Pets','Tools','Office','Travel'];

  return(
    <div style={{maxWidth:'1100px',margin:'2rem auto',padding:'0 1rem',paddingTop:'80px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
        <h2 style={{fontFamily:'var(--display)',fontSize:'1.5rem'}}>Manage Products <span style={{color:'var(--text2)',fontSize:'1rem',fontWeight:400}}>({products.length})</span></h2>
        <button onClick={openAdd}
          style={{background:'var(--grad)',color:'#fff',border:'none',padding:'10px 20px',borderRadius:'8px',cursor:'pointer',fontWeight:'bold'}}>
          + Add Product
        </button>
      </div>

      {msg&&<div style={{padding:'12px 16px',borderRadius:'8px',marginBottom:'1rem',background:msg.startsWith('✅')?'rgba(52,211,153,.1)':'rgba(248,113,113,.1)',color:msg.startsWith('✅')?'var(--green)':'var(--red)',border:`1px solid ${msg.startsWith('✅')?'var(--green)':'var(--red)'}`}}>{msg}</div>}

      {/* Form */}
      {showForm&&(
        <div ref={formRef} style={{background:'var(--card)',border:'1px solid var(--border2)',borderRadius:'16px',padding:'1.5rem',marginBottom:'2rem'}}>
          <h3 style={{marginBottom:'1.2rem',fontFamily:'var(--display)'}}>{editId?'Edit Product':'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'1rem',marginBottom:'1rem'}}>
              {[
                ['name','Product Name','text',true],
                ['brand','Brand','text',false],
                ['price','Price ($)','number',true],
                ['comparePrice','Compare Price ($)','number',false],
                ['stock','Stock Quantity','number',true],
              ].map(([f,p,t,req])=>(
                <div key={f}>
                  <label style={{fontSize:'.8rem',color:'var(--text2)',marginBottom:'4px',display:'block'}}>{p}{req&&' *'}</label>
                  <input type={t} placeholder={p} value={form[f]} required={req}
                    onChange={e=>setForm({...form,[f]:e.target.value})}
                    style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid var(--border2)',background:'var(--bg)',color:'var(--text)',fontSize:'.9rem',outline:'none'}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:'.8rem',color:'var(--text2)',marginBottom:'4px',display:'block'}}>Category *</label>
                <select value={form.category} required onChange={e=>setForm({...form,category:e.target.value})}
                  style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid var(--border2)',background:'var(--bg)',color:'var(--text)',fontSize:'.9rem',outline:'none'}}>
                  <option value=''>Select Category</option>
                  {cats.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label style={{fontSize:'.8rem',color:'var(--text2)',marginBottom:'4px',display:'block'}}>Image URL</label>
              <input type="url" placeholder="https://images.unsplash.com/..." value={form.imageUrl}
                onChange={e=>setForm({...form,imageUrl:e.target.value})}
                style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid var(--border2)',background:'var(--bg)',color:'var(--text)',fontSize:'.9rem',outline:'none'}}/>
              {form.imageUrl&&(
                <div style={{marginTop:'8px',display:'flex',alignItems:'center',gap:'10px'}}>
                  <img src={form.imageUrl} alt="preview" style={{width:'60px',height:'60px',objectFit:'cover',borderRadius:'8px',border:'1px solid var(--border)'}}
                    onError={e=>{e.target.style.display='none';}}/>
                  <span style={{fontSize:'.78rem',color:'var(--green)'}}>✅ Image preview</span>
                </div>
              )}
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label style={{fontSize:'.8rem',color:'var(--text2)',marginBottom:'4px',display:'block'}}>Description *</label>
              <textarea placeholder="Product description..." value={form.description} required
                onChange={e=>setForm({...form,description:e.target.value})}
                style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid var(--border2)',background:'var(--bg)',color:'var(--text)',fontSize:'.9rem',outline:'none',minHeight:'100px',resize:'vertical'}}/>
            </div>

            <div style={{marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:'8px'}}>
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e=>setForm({...form,isFeatured:e.target.checked})}/>
              <label htmlFor="featured" style={{fontSize:'.9rem',cursor:'pointer'}}>Mark as Featured Product</label>
            </div>

            <div style={{display:'flex',gap:'10px'}}>
              <button type="submit" disabled={loading}
                style={{flex:1,background:'var(--grad)',color:'#fff',border:'none',padding:'12px',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',fontSize:'.95rem'}}>
                {loading?'Saving...':(editId?'Update Product':'Create Product')}
              </button>
              <button type="button" onClick={()=>{setShowForm(false);setEditId(null);}}
                style={{padding:'12px 20px',background:'var(--card2)',color:'var(--text2)',border:'1px solid var(--border)',borderRadius:'8px',cursor:'pointer'}}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',background:'var(--card)',borderRadius:'12px',overflow:'hidden'}}>
          <thead style={{background:'var(--bg2)'}}>
            <tr>{['Image','Name','Category','Price','Stock','Rating','Actions'].map(h=>(
              <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'.82rem',color:'var(--text2)',fontWeight:600,whiteSpace:'nowrap'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {products.map((p,i)=>(
              <tr key={p._id} style={{borderTop:'1px solid var(--border)',background:i%2===0?'transparent':'rgba(255,255,255,.01)'}}>
                <td style={{padding:'10px 16px'}}>
                  <img src={p.images?.[0]?.url||'https://placehold.co/40x40/13131F/7C6FFF?text=?'} alt=""
                    style={{width:'44px',height:'44px',objectFit:'cover',borderRadius:'8px',border:'1px solid var(--border)'}}
                    onError={e=>{e.target.src='https://placehold.co/40x40/13131F/7C6FFF?text=?';}}/>
                </td>
                <td style={{padding:'10px 16px',fontWeight:600,fontSize:'.88rem',maxWidth:'200px'}}>
                  <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                  {p.brand&&<div style={{fontSize:'.75rem',color:'var(--text2)'}}>{p.brand}</div>}
                </td>
                <td style={{padding:'10px 16px',color:'var(--text2)',fontSize:'.85rem'}}>{p.category}</td>
                <td style={{padding:'10px 16px',fontWeight:700,color:'var(--p2)'}}>${p.price}</td>
                <td style={{padding:'10px 16px'}}>
                  <span style={{color:p.stock<=5?'var(--red)':p.stock<=20?'var(--gold)':'var(--green)',fontWeight:700}}>{p.stock}</span>
                </td>
                <td style={{padding:'10px 16px',color:'var(--gold)'}}>⭐ {p.rating?.toFixed(1)||'0.0'}</td>
                <td style={{padding:'10px 16px'}}>
                  <div style={{display:'flex',gap:'6px'}}>
                    <button onClick={()=>handleEdit(p)}
                      style={{padding:'6px 14px',background:'rgba(52,152,219,.15)',color:'#3498db',border:'1px solid rgba(52,152,219,.3)',borderRadius:'6px',cursor:'pointer',fontSize:'.8rem',fontWeight:600}}>
                      Edit
                    </button>
                    <button onClick={()=>handleDelete(p._id)}
                      style={{padding:'6px 14px',background:'rgba(231,76,60,.15)',color:'#e74c3c',border:'1px solid rgba(231,76,60,.3)',borderRadius:'6px',cursor:'pointer',fontSize:'.8rem',fontWeight:600}}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}