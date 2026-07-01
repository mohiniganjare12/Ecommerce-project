import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
 
const PAYMENT_METHODS = [
  {
    id: 'card', label: 'Credit / Debit Card', icon: '💳',
    desc: 'Visa, Mastercard, RuPay, Amex',
    badge: 'Most Popular',
  },
  {
    id: 'upi', label: 'UPI', icon: '📱',
    desc: 'GPay, PhonePe, Paytm, BHIM',
    badge: 'Instant',
  },
  {
    id: 'netbank', label: 'Net Banking', icon: '🏦',
    desc: 'All major banks supported',
    badge: null,
  },
  {
    id: 'wallet', label: 'Wallets', icon: '👛',
    desc: 'Paytm, Amazon Pay, Freecharge',
    badge: null,
  },
  {
    id: 'emi', label: 'EMI', icon: '📅',
    desc: 'No-cost EMI on cards & Bajaj Finserv',
    badge: 'No Cost',
  },
  {
    id: 'cod', label: 'Cash on Delivery', icon: '💵',
    desc: 'Pay when your order arrives',
    badge: null,
  },
];
 
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '🟢' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
  { id: 'paytm', name: 'Paytm', icon: '🔵' },
  { id: 'bhim', name: 'BHIM', icon: '🇮🇳' },
  { id: 'other', name: 'Other UPI', icon: '📱' },
];
 
const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra', 'Yes Bank', 'Punjab National Bank', 'Bank of Baroda',
];
 
const EMI_PLANS = [
  { months: 3, rate: 0, label: '3 Months', tag: 'No Cost' },
  { months: 6, rate: 0, label: '6 Months', tag: 'No Cost' },
  { months: 9, rate: 1.5, label: '9 Months', tag: null },
  { months: 12, rate: 1.5, label: '12 Months', tag: null },
];
 
const WALLETS = [
  { id: 'paytm_w', name: 'Paytm Wallet', icon: '🔵' },
  { id: 'amazon', name: 'Amazon Pay', icon: '🟠' },
  { id: 'free', name: 'Freecharge', icon: '🔴' },
  { id: 'mobik', name: 'MobiKwik', icon: '🟡' },
];
 
export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
 
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('card');
  const [upiApp, setUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState('');
  const [wallet, setWallet] = useState('paytm_w');
  const [emiPlan, setEmiPlan] = useState(3);
  const [saveAddr, setSaveAddr] = useState(true);
 
  const [addr, setAddr] = useState({
    name: user?.name || '', phone: '', street: '',
    city: '', state: '', zip: '', country: 'India',
  });
 
  const [card, setCard] = useState({
    number: '', expiry: '', cvv: '', name: '',
  });
 
  const shipping = cartTotal >= 500 ? 0 : 40;
  const tax = cartTotal * 0.18;
  const total = cartTotal + shipping + tax;
 
  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
 
  const addrValid = addr.name && addr.phone && addr.street && addr.city && addr.state && addr.zip;
 
  const placeOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cart.items.map(i => ({
          product: i.product._id,
          name: i.product.name,
          image: i.product.images?.[0]?.url || '',
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress: addr,
        paymentMethod: payMethod,
        itemsPrice: cartTotal,
        shippingPrice: shipping,
        taxPrice: parseFloat(tax.toFixed(2)),
        totalPrice: parseFloat(total.toFixed(2)),
        isPaid: payMethod !== 'cod',
        paidAt: payMethod !== 'cod' ? new Date() : null,
      };
      await api.post('/orders', orderData);
      clearCart();
      toast.success('🎉 Order placed successfully!');
      nav('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Try again.');
    } finally { setLoading(false); }
  };
 
  const steps = [
    { n: 1, label: 'Delivery Address', icon: '📍' },
    { n: 2, label: 'Payment', icon: '💳' },
    { n: 3, label: 'Review & Pay', icon: '✅' },
  ];
 
  return (
    <div style={S.page}>
      <div className="container">
        {/* Step Header */}
        <div style={S.stepHeader}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{ ...S.stepItem, cursor: s.n < step ? 'pointer' : 'default' }}
                onClick={() => s.n < step && setStep(s.n)}
              >
                <div style={{
                  ...S.stepCircle,
                  background: step >= s.n ? 'var(--grad)' : 'var(--card2)',
                  boxShadow: step === s.n ? '0 0 0 4px var(--pglow)' : 'none',
                  border: `2px solid ${step >= s.n ? 'var(--p)' : 'var(--border)'}`,
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em' }}>Step {s.n}</div>
                  <div style={{ fontSize: '.86rem', fontWeight: 700, color: step >= s.n ? 'var(--text)' : 'var(--text3)' }}>{s.label}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: step > s.n ? 'var(--p)' : 'var(--border)', margin: '0 12px', borderRadius: '2px', transition: 'background .4s ease' }} />
              )}
            </div>
          ))}
        </div>
 
        <div style={S.layout}>
          {/* LEFT — Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
 
            {/* ── STEP 1: ADDRESS ── */}
            {step === 1 && (
              <div style={S.card} className="fade-up">
                <div style={S.cardHead}>
                  <span style={S.cardHeadIcon}>📍</span>
                  <div>
                    <h2 style={S.cardTitle}>Delivery Address</h2>
                    <p style={{ color: 'var(--text2)', fontSize: '.84rem' }}>Where should we deliver your order?</p>
                  </div>
                </div>
 
                <div style={S.formGrid}>
                  {[
                    { key: 'name', label: 'Full Name', ph: 'Enter your full name', type: 'text', icon: '👤', half: false },
                    { key: 'phone', label: 'Mobile Number', ph: '10-digit mobile number', type: 'tel', icon: '📞', half: false },
                    { key: 'street', label: 'Address (House No, Street, Area)', ph: 'e.g. 123, Park Lane, MG Road', type: 'text', icon: '🏠', half: false },
                    { key: 'city', label: 'City', ph: 'City', type: 'text', icon: '🏙️', half: true },
                    { key: 'state', label: 'State', ph: 'State', type: 'text', icon: '📌', half: true },
                    { key: 'zip', label: 'PIN Code', ph: '6-digit PIN', type: 'text', icon: '📮', half: true },
                    { key: 'country', label: 'Country', ph: 'Country', type: 'text', icon: '🌍', half: true },
                  ].map(f => (
                    <div key={f.key} style={{ gridColumn: f.half ? 'span 1' : 'span 2' }}>
                      <label style={S.label}>{f.icon} {f.label}</label>
                      <input
                        type={f.type}
                        value={addr[f.key]}
                        onChange={e => setAddr({ ...addr, [f.key]: e.target.value })}
                        placeholder={f.ph}
                        style={{ ...S.input, ...(addr[f.key] ? S.inputFilled : {}) }}
                      />
                    </div>
                  ))}
                </div>
 
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem', marginBottom: '1.5rem' }}>
                  <div onClick={() => setSaveAddr(!saveAddr)} style={{ ...S.checkbox, background: saveAddr ? 'var(--p)' : 'transparent' }}>
                    {saveAddr && <span style={{ color: '#fff', fontSize: '.7rem' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '.84rem', color: 'var(--text2)', cursor: 'pointer' }} onClick={() => setSaveAddr(!saveAddr)}>
                    Save this address for future orders
                  </span>
                </div>
 
                <button
                  onClick={() => { if (!addrValid) { toast.warn('Please fill all required fields'); return; } setStep(2); }}
                  style={S.continueBtn}
                >
                  Continue to Payment →
                </button>
              </div>
            )}
 
            {/* ── STEP 2: PAYMENT ── */}
            {step === 2 && (
              <div style={S.card} className="fade-up">
                <div style={S.cardHead}>
                  <span style={S.cardHeadIcon}>💳</span>
                  <div>
                    <h2 style={S.cardTitle}>Payment Method</h2>
                    <p style={{ color: 'var(--text2)', fontSize: '.84rem' }}>100% secure & encrypted payments</p>
                  </div>
                </div>
 
                <div style={S.payGrid}>
                  {PAYMENT_METHODS.map(pm => (
                    <div
                      key={pm.id}
                      onClick={() => setPayMethod(pm.id)}
                      style={{ ...S.payCard, ...(payMethod === pm.id ? S.payCardActive : {}) }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ ...S.payRadio, ...(payMethod === pm.id ? S.payRadioActive : {}) }}>
                          {payMethod === pm.id && <div style={S.payRadioDot} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.3rem' }}>{pm.icon}</span>
                            <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{pm.label}</span>
                            {pm.badge && (
                              <span style={{ background: 'var(--grad)', color: '#fff', fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{pm.badge}</span>
                            )}
                          </div>
                          <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginTop: '3px' }}>{pm.desc}</div>
                        </div>
                      </div>
 
                      {/* Expanded content */}
                      {payMethod === pm.id && (
                        <div style={S.payExpand}>
                          {/* CARD */}
                          {pm.id === 'card' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={S.cardPreview}>
                                <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.6)', marginBottom: '20px', letterSpacing: '.1em' }}>NEXUSSHOP CARD</div>
                                <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '.2em', marginBottom: '16px' }}>
                                  {card.number || '•••• •••• •••• ••••'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem' }}>
                                  <div><div style={{ opacity: .6, marginBottom: '2px' }}>CARD HOLDER</div>{card.name || user?.name || 'YOUR NAME'}</div>
                                  <div><div style={{ opacity: .6, marginBottom: '2px' }}>EXPIRES</div>{card.expiry || 'MM/YY'}</div>
                                </div>
                              </div>
                              {[
                                { key: 'number', label: 'Card Number', ph: '1234 5678 9012 3456', format: formatCard },
                                { key: 'name', label: 'Name on Card', ph: 'As on card', format: v => v },
                                { key: 'expiry', label: 'Expiry Date', ph: 'MM/YY', format: formatExpiry },
                                { key: 'cvv', label: 'CVV', ph: '•••', format: v => v.replace(/\D/g, '').slice(0, 3) },
                              ].map(f => (
                                <div key={f.key}>
                                  <label style={S.label}>{f.label}</label>
                                  <input
                                    type={f.key === 'cvv' ? 'password' : 'text'}
                                    value={card[f.key]}
                                    onChange={e => setCard({ ...card, [f.key]: f.format(e.target.value) })}
                                    placeholder={f.ph}
                                    style={S.input}
                                  />
                                </div>
                              ))}
                              <div style={{ background: 'rgba(52,211,153,.07)', border: '1px solid rgba(52,211,153,.2)', borderRadius: '8px', padding: '9px 13px', fontSize: '.75rem', color: 'var(--green)', display: 'flex', gap: '7px' }}>
                                🧪 Test: <strong>4242 4242 4242 4242</strong> | Any future date | Any 3-digit CVV
                              </div>
                            </div>
                          )}
 
                          {/* UPI */}
                          {pm.id === 'upi' && (
                            <div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginBottom: '16px' }}>
                                {UPI_APPS.map(a => (
                                  <div key={a.id} onClick={() => setUpiApp(a.id)}
                                    style={{ ...S.upiApp, ...(upiApp === a.id ? S.upiAppActive : {}) }}>
                                    <span style={{ fontSize: '1.6rem' }}>{a.icon}</span>
                                    <span style={{ fontSize: '.68rem', fontWeight: 600, marginTop: '4px' }}>{a.name}</span>
                                  </div>
                                ))}
                              </div>
                              <label style={S.label}>UPI ID</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" style={{ ...S.input, flex: 1 }} />
                                <button style={S.verifyBtn}>Verify</button>
                              </div>
                              <div style={{ fontSize: '.76rem', color: 'var(--text2)', marginTop: '8px' }}>
                                💡 Enter your UPI ID to pay instantly from your bank account
                              </div>
                            </div>
                          )}
 
                          {/* NET BANKING */}
                          {pm.id === 'netbank' && (
                            <div>
                              <label style={S.label}>Select Your Bank</label>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px', marginBottom: '12px' }}>
                                {BANKS.map(b => (
                                  <div key={b} onClick={() => setBank(b)}
                                    style={{ ...S.bankItem, ...(bank === b ? S.bankItemActive : {}) }}>
                                    <div style={{ ...S.bankRadio, ...(bank === b ? S.bankRadioActive : {}) }}>
                                      {bank === b && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                                    </div>
                                    🏦 {b}
                                  </div>
                                ))}
                              </div>
                              <div style={{ fontSize: '.76rem', color: 'var(--text2)' }}>You will be redirected to your bank's secure page to complete payment.</div>
                            </div>
                          )}
 
                          {/* WALLET */}
                          {pm.id === 'wallet' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                              {WALLETS.map(w => (
                                <div key={w.id} onClick={() => setWallet(w.id)}
                                  style={{ ...S.walletItem, ...(wallet === w.id ? S.walletItemActive : {}) }}>
                                  <span style={{ fontSize: '1.5rem' }}>{w.icon}</span>
                                  <span style={{ fontWeight: 600, fontSize: '.86rem' }}>{w.name}</span>
                                  {wallet === w.id && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '.9rem' }}>✓</span>}
                                </div>
                              ))}
                            </div>
                          )}
 
                          {/* EMI */}
                          {pm.id === 'emi' && (
                            <div>
                              <label style={S.label}>Select EMI Plan</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {EMI_PLANS.map(p => {
                                  const monthlyAmt = p.rate === 0
                                    ? (total / p.months).toFixed(0)
                                    : ((total * (1 + p.rate / 100)) / p.months).toFixed(0);
                                  return (
                                    <div key={p.months} onClick={() => setEmiPlan(p.months)}
                                      style={{ ...S.emiItem, ...(emiPlan === p.months ? S.emiItemActive : {}) }}>
                                      <div style={{ ...S.payRadio, flexShrink: 0, ...(emiPlan === p.months ? S.payRadioActive : {}) }}>
                                        {emiPlan === p.months && <div style={S.payRadioDot} />}
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{p.label}</div>
                                        <div style={{ fontSize: '.76rem', color: 'var(--text2)' }}>₹{monthlyAmt}/month</div>
                                      </div>
                                      {p.tag && <span style={{ background: 'var(--grad)', color: '#fff', fontSize: '.62rem', fontWeight: 700, padding: '3px 9px', borderRadius: '20px' }}>{p.tag}</span>}
                                      {p.rate > 0 && <span style={{ fontSize: '.74rem', color: 'var(--text2)' }}>{p.rate}% p.a.</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
 
                          {/* COD */}
                          {pm.id === 'cod' && (
                            <div style={{ background: 'rgba(251,191,36,.07)', border: '1px solid rgba(251,191,36,.2)', borderRadius: '10px', padding: '14px 16px' }}>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '1.5rem' }}>💵</span>
                                <div>
                                  <div style={{ fontWeight: 700, marginBottom: '5px' }}>Cash on Delivery</div>
                                  <div style={{ fontSize: '.82rem', color: 'var(--text2)', lineHeight: '1.6' }}>
                                    Pay <strong style={{ color: 'var(--text)' }}>${total.toFixed(2)}</strong> in cash when your order arrives.
                                    Please keep exact change ready. COD available for orders under $500.
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
 
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button onClick={() => setStep(1)} style={S.backBtn}>← Back</button>
                  <button onClick={() => setStep(3)} style={{ ...S.continueBtn, flex: 1 }}>Review Order →</button>
                </div>
              </div>
            )}
 
            {/* ── STEP 3: REVIEW ── */}
            {step === 3 && (
              <div style={S.card} className="fade-up">
                <div style={S.cardHead}>
                  <span style={S.cardHeadIcon}>✅</span>
                  <div>
                    <h2 style={S.cardTitle}>Review Your Order</h2>
                    <p style={{ color: 'var(--text2)', fontSize: '.84rem' }}>Please verify everything before placing your order</p>
                  </div>
                </div>
 
                {/* Delivery summary */}
                <div style={S.reviewSection}>
                  <div style={S.reviewHead}>
                    <span>📍 Delivery Address</span>
                    <button onClick={() => setStep(1)} style={S.editBtn}>Edit</button>
                  </div>
                  <div style={{ fontSize: '.88rem', lineHeight: '1.75', color: 'var(--text)' }}>
                    <strong>{addr.name}</strong> · 📞 {addr.phone}<br />
                    {addr.street}, {addr.city}, {addr.state} - {addr.zip}<br />
                    {addr.country}
                  </div>
                </div>
 
                {/* Payment summary */}
                <div style={S.reviewSection}>
                  <div style={S.reviewHead}>
                    <span>💳 Payment Method</span>
                    <button onClick={() => setStep(2)} style={S.editBtn}>Edit</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{PAYMENT_METHODS.find(p => p.id === payMethod)?.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{PAYMENT_METHODS.find(p => p.id === payMethod)?.label}</div>
                      {payMethod === 'card' && card.number && (
                        <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>Card ending in {card.number.replace(/\s/g, '').slice(-4)}</div>
                      )}
                      {payMethod === 'upi' && upiId && (
                        <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>{upiId}</div>
                      )}
                      {payMethod === 'netbank' && bank && (
                        <div style={{ fontSize: '.78rem', color: 'var(--text2)' }}>{bank}</div>
                      )}
                    </div>
                  </div>
                </div>
 
                {/* Items summary */}
                <div style={S.reviewSection}>
                  <div style={{ ...S.reviewHead, marginBottom: '12px' }}>
                    <span>📦 Order Items ({cart.items?.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cart.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img
                          src={item.product?.images?.[0]?.url || `https://placehold.co/56x56/13131F/7C6FFF?text=P`}
                          alt={item.product?.name}
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</div>
                          <div style={{ fontSize: '.76rem', color: 'var(--text2)', marginTop: '3px' }}>Qty: {item.quantity} × ${item.price?.toFixed(2)}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '.95rem', flexShrink: 0 }}>${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
 
                {/* Promises */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {['🔒 Secure Payment', '📦 Easy Returns', '🚚 Fast Delivery', '✅ 100% Genuine'].map(p => (
                    <span key={p} style={{ background: 'rgba(52,211,153,.07)', border: '1px solid rgba(52,211,153,.2)', color: 'var(--green)', fontSize: '.72rem', fontWeight: 600, padding: '4px 11px', borderRadius: '20px' }}>{p}</span>
                  ))}
                </div>
 
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStep(2)} style={S.backBtn}>← Back</button>
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    style={{ ...S.payNowBtn, flex: 1 }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                        <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                        Placing Order…
                      </span>
                    ) : (
                      <>🔒 Place Order · ${total.toFixed(2)}</>
                    )}
                  </button>
                </div>
 
                <p style={{ textAlign: 'center', fontSize: '.74rem', color: 'var(--text3)', marginTop: '12px' }}>
                  By placing this order you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            )}
          </div>
 
          {/* RIGHT — Order Summary (sticky) */}
          <div style={S.summaryCol}>
            <div style={S.summaryCard}>
              <h3 style={S.summaryTitle}>Order Summary</h3>
 
              {/* Items */}
              <div style={{ maxHeight: '240px', overflow: 'auto', marginBottom: '1rem' }}>
                {cart.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={item.product?.images?.[0]?.url || `https://placehold.co/44x44/13131F/7C6FFF?text=P`}
                        alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '7px', border: '1px solid var(--border)' }} />
                      <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--p)', color: '#fff', width: '16px', height: '16px', borderRadius: '50%', fontSize: '.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', flexShrink: 0 }}>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
 
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {[
                  ['Subtotal', `$${cartTotal.toFixed(2)}`],
                  ['Shipping', shipping === 0 ? '🎉 FREE' : `$${shipping.toFixed(2)}`],
                  ['Tax (18% GST)', `$${tax.toFixed(2)}`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.86rem', color: 'var(--text2)' }}>
                    <span>{l}</span>
                    <span style={{ color: v === '🎉 FREE' ? 'var(--green)' : undefined, fontWeight: v === '🎉 FREE' ? 700 : 400 }}>{v}</span>
                  </div>
                ))}
              </div>
 
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '10px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--display)', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>${total.toFixed(2)}</span>
              </div>
 
              {shipping > 0 && (
                <div style={{ marginTop: '10px', background: 'rgba(251,191,36,.07)', border: '1px solid rgba(251,191,36,.18)', borderRadius: '8px', padding: '8px 12px', fontSize: '.76rem', color: 'var(--gold)' }}>
                  🚚 Add <strong>${(500 - cartTotal).toFixed(0)}</strong> more for FREE shipping!
                </div>
              )}
 
              {/* Security badges */}
              <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {['🔒 256-bit SSL Encryption', '✅ 100% Purchase Protection', '↩️ 30-Day Easy Returns'].map(b => (
                  <div key={b} style={{ fontSize: '.74rem', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px' }}>{b}</div>
                ))}
              </div>
            </div>
 
            {/* Promo Code Box */}
            <div style={{ ...S.summaryCard, marginTop: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '10px' }}>🏷️ Promo Code</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input placeholder="Enter promo code" style={{ ...S.input, flex: 1, fontSize: '.82rem', padding: '9px 12px' }} />
                <button style={S.verifyBtn}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade-up{animation:fadeUp .4s ease both}
      `}</style>
    </div>
  );
}
 
const S = {
  page: { background: 'var(--bg)', minHeight: '100vh', paddingBottom: '5rem', paddingTop: '1.5rem' },
  stepHeader: { display: 'flex', alignItems: 'center', marginBottom: '2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '1.4rem 2rem' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  stepCircle: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.88rem', color: '#fff', flexShrink: 0, transition: 'all .3s ease' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '2rem' },
  cardHead: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.8rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' },
  cardHeadIcon: { fontSize: '2rem', width: '52px', height: '52px', background: 'var(--card2)', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' },
  cardTitle: { fontFamily: 'var(--display)', fontSize: '1.25rem', fontWeight: 700 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  label: { display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', letterSpacing: '.02em' },
  input: { width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: '9px', padding: '11px 14px', fontSize: '.9rem', color: 'var(--text)', outline: 'none', transition: 'var(--t)', boxSizing: 'border-box' },
  inputFilled: { borderColor: 'rgba(124,111,255,.4)', background: 'rgba(124,111,255,.04)' },
  checkbox: { width: '18px', height: '18px', borderRadius: '5px', border: '2px solid var(--p)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'var(--t)' },
  continueBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: '11px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 18px var(--pglow)', transition: 'var(--t)' },
  backBtn: { padding: '14px 20px', background: 'var(--card2)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: '11px', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'var(--t)', whiteSpace: 'nowrap' },
  payGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  payCard: { background: 'var(--card2)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 16px', cursor: 'pointer', transition: 'all .2s ease' },
  payCardActive: { border: '1.5px solid var(--p)', background: 'rgba(124,111,255,.06)', boxShadow: '0 0 0 3px var(--pglow)' },
  payRadio: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', transition: 'var(--t)' },
  payRadioActive: { borderColor: 'var(--p)', background: 'var(--p)' },
  payRadioDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#fff' },
  payExpand: { marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' },
  cardPreview: { background: 'linear-gradient(135deg,#1a1a3e,#2d1b69,#6C63FF)', borderRadius: '12px', padding: '20px', color: '#fff', marginBottom: '14px', boxShadow: '0 8px 24px rgba(108,99,255,.4)' },
  upiApp: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '10px', cursor: 'pointer', transition: 'var(--t)', fontSize: '.7rem', fontWeight: 600, color: 'var(--text2)', gap: '4px' },
  upiAppActive: { border: '1.5px solid var(--p)', background: 'rgba(124,111,255,.08)', color: 'var(--p2)' },
  verifyBtn: { padding: '11px 18px', background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  bankItem: { display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '9px', cursor: 'pointer', fontSize: '.82rem', fontWeight: 500, transition: 'var(--t)' },
  bankItemActive: { border: '1.5px solid var(--p)', background: 'rgba(124,111,255,.06)', color: 'var(--p2)', fontWeight: 600 },
  bankRadio: { width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'var(--t)' },
  bankRadioActive: { borderColor: 'var(--p)', background: 'var(--p)' },
  walletItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '10px', cursor: 'pointer', transition: 'var(--t)' },
  walletItemActive: { border: '1.5px solid var(--p)', background: 'rgba(124,111,255,.06)' },
  emiItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '10px', cursor: 'pointer', transition: 'var(--t)' },
  emiItemActive: { border: '1.5px solid var(--p)', background: 'rgba(124,111,255,.06)' },
  reviewSection: { background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1.1rem 1.3rem', marginBottom: '1rem' },
  reviewHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '.88rem', marginBottom: '8px' },
  editBtn: { background: 'none', border: 'none', color: 'var(--p)', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', padding: '3px 10px', borderRadius: '6px', transition: 'var(--t)' },
  payNowBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: 'linear-gradient(135deg,#16A34A,#15803d)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(22,163,74,.4)', transition: 'var(--t)' },
  summaryCol: { position: 'sticky', top: '80px' },
  summaryCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '1.5rem' },
  summaryTitle: { fontFamily: 'var(--display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', paddingBottom: '.8rem', borderBottom: '1px solid var(--border)' },
};