'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerApi, saveToken, saveUser } from '@/lib/authService'

const departments = [
  'Kỹ thuật', 'Thiết kế', 'Kinh doanh', 'Nhân sự', 'Marketing', 'Tài chính', 'Data', 'Product',
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', department: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({}); setGlobalError('')
    setLoading(true)
    try {
      const res = await registerApi(form)
      if (res.success && res.data) {
        saveToken(res.data.token); saveUser(res.data.user)
        router.push('/booking')
      } else if (res.errors) {
        const e: Record<string, string> = {}
        res.errors.forEach((err: any) => { e[err.field] = err.message })
        setErrors(e)
      } else {
        setGlobalError(res.message || 'Đăng ký thất bại')
      }
    } catch { setGlobalError('Không thể kết nối server') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=DM+Serif+Display:ital@0;1&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .vcb-root { font-family: 'DM Sans', sans-serif; background: #fcf8fb; color: #323236; }
        .vcb-serif { font-family: 'DM Serif Display', serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; font-family: 'Material Symbols Outlined'; }
        .fill-icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

        .asymmetric { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        .blob-tl { position: absolute; top: -10%; left: -10%; width: 600px; height: 600px; background: rgba(0,109,78,0.04); filter: blur(80px); }
        .blob-br { position: absolute; bottom: -5%; right: -5%; width: 400px; height: 400px; background: rgba(45,103,110,0.04); filter: blur(60px); }

        .input-field {
          width: 100%;
          padding: 13px 16px 13px 48px;
          background: #fcf8fb;
          border: 1.5px solid rgba(178,177,182,0.15);
          border-radius: 12px;
          font-size: 13.5px;
          color: #323236;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        .input-field::placeholder { color: rgba(123,122,127,0.5); }
        .input-field:focus {
          background: #fff;
          border-color: #006d4e;
          box-shadow: 0 0 0 4px rgba(0,109,78,0.08);
        }
        .input-error { border-color: rgba(168,56,54,0.4) !important; }
        .select-field {
          width: 100%;
          padding: 13px 44px 13px 48px;
          background: #fcf8fb;
          border: 1.5px solid rgba(178,177,182,0.15);
          border-radius: 12px;
          font-size: 13.5px;
          color: #323236;
          font-family: 'DM Sans', sans-serif;
          appearance: none;
          transition: all 0.2s ease;
          outline: none;
          cursor: pointer;
          box-sizing: border-box;
        }
        .select-field:focus {
          background: #fff;
          border-color: #006d4e;
          box-shadow: 0 0 0 4px rgba(0,109,78,0.08);
        }
        .select-empty { color: rgba(123,122,127,0.5); }

        .gradient-btn {
          width: 100%;
          padding: 15px 24px;
          background: linear-gradient(135deg, #006d4e 0%, #00a872 100%);
          color: #e5fff0;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(0,109,78,0.2);
        }
        .gradient-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .gradient-btn:active { transform: scale(0.98); }
        .gradient-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .social-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 16px;
          background: #fcf8fb;
          border: 1.5px solid rgba(178,177,182,0.1);
          border-radius: 12px;
          font-size: 12px; font-weight: 500;
          color: #323236;
          cursor: pointer; transition: background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .social-btn:hover { background: #efedf1; }
        .feature-card {
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(8px);
        }
        .feature-icon {
          width: 44px; height: 44px;
          background: rgba(0,109,78,0.08);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .fade-in { animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .img-card { border-radius: 16px; overflow: hidden; transition: transform 0.7s ease; }
        .img-card:hover img { transform: scale(1.05); }
        .img-card img { transition: transform 0.7s ease; }
      `}</style>

      <div className="vcb-root" style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT VISUAL PANEL ── */}
        <section style={{
          position: 'relative',
          flex: '0 0 55%',
          background: '#efedf1',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 80px',
          overflow: 'hidden',
        }} className="lg-show">
          <style>{`@media (min-width: 1024px) { .lg-show { display: flex !important; } }`}</style>

          <div className="blob-tl asymmetric" />
          <div className="blob-br asymmetric" />

          <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 520 }}>
            <div style={{ marginBottom: 48 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#006d4e', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
                Workspace Management
              </span>
              <h1 className="vcb-serif" style={{
                fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#323236',
                marginBottom: 24,
                fontWeight: 400,
              }}>
                Nghệ thuật<br />
                vận hành <em style={{ color: '#006d4e' }}>linh hoạt.</em>
              </h1>
              <p style={{ fontSize: 15, color: '#5f5f63', lineHeight: 1.65, maxWidth: 400 }}>
                Bước vào workspace được thiết kế cho sự chính xác. Viên Chi Bảo mang lại sự rõ ràng kiến trúc mà đội ngũ bạn xứng đáng.
              </p>
            </div>

            {/* Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr', gap: 16, alignItems: 'end' }}>
              <div className="img-card" style={{ aspectRatio: '4/3', background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=70"
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{
                  aspectRatio: '1/1',
                  background: 'rgba(112,248,194,0.12)',
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#006d4e', fontVariationSettings: "'wght' 200" }}>architecture</span>
                </div>
                <div style={{
                  padding: '16px',
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ width: 28, height: 3, background: '#006d4e', borderRadius: 2, marginBottom: 10 }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#323236', marginBottom: 4 }}>Theo dõi chính xác</p>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#7b7a7f', textTransform: 'uppercase' }}>Trạng thái: Hoạt động</p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand footer */}
          <div style={{ position: 'absolute', bottom: 48, left: 80, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: '#323236', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fcf8fb', fontWeight: 700, fontSize: 16 }}>V</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: '#323236' }}>Viên Chi Bảo</span>
          </div>
        </section>

        {/* ── RIGHT FORM PANEL ── */}
        <section style={{
          flex: 1,
          background: '#fcf8fb',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 32px',
          overflowY: 'auto',
        }}>
          {/* Mobile brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }} className="mobile-brand">
            <style>{`@media (min-width: 1024px) { .mobile-brand { display: none !important; } }`}</style>
            <div style={{ width: 32, height: 32, background: '#323236', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fcf8fb', fontWeight: 700 }}>V</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#323236' }}>Viên Chi Bảo</span>
          </div>

          <div className="fade-in" style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
            <header style={{ marginBottom: 32 }}>
              <h2 className="vcb-serif" style={{ fontSize: 28, fontWeight: 400, color: '#323236', marginBottom: 6, letterSpacing: '-0.01em' }}>
                Tạo tài khoản
              </h2>
              <p style={{ fontSize: 13, color: '#5f5f63' }}>Gia nhập không gian làm việc hiện đại.</p>
            </header>

            {globalError && (
              <div style={{
                marginBottom: 20, padding: '12px 16px',
                background: 'rgba(168,56,54,0.06)',
                border: '1px solid rgba(168,56,54,0.15)',
                borderRadius: 12, fontSize: 13, color: '#a83836', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#7b7a7f', textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 }}>
                  Họ và tên
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 19, color: '#7b7a7f' }}>person</span>
                  <input
                    type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A" required
                    className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                  />
                </div>
                {errors.fullName && <p style={{ marginTop: 4, fontSize: 11, color: '#a83836', marginLeft: 2 }}>{errors.fullName}</p>}
              </div>

              {/* Work Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#7b7a7f', textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 }}>
                  Email công việc
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 19, color: '#7b7a7f' }}>alternate_email</span>
                  <input
                    type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="name@organization.com" required
                    className={`input-field ${errors.email ? 'input-error' : ''}`}
                  />
                </div>
                {errors.email && <p style={{ marginTop: 4, fontSize: 11, color: '#a83836', marginLeft: 2 }}>{errors.email}</p>}
              </div>

              {/* Department */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#7b7a7f', textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 }}>
                  Phòng ban
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 19, color: '#7b7a7f', zIndex: 1 }}>corporate_fare</span>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    required
                    className={`select-field ${!form.department ? 'select-empty' : ''} ${errors.department ? 'input-error' : ''}`}
                  >
                    <option value="" disabled>Chọn phòng ban</option>
                    {departments.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#7b7a7f', pointerEvents: 'none' }}>unfold_more</span>
                </div>
                {errors.department && <p style={{ marginTop: 4, fontSize: 11, color: '#a83836', marginLeft: 2 }}>{errors.department}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#7b7a7f', textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 }}>
                  Mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 19, color: '#7b7a7f' }}>lock</span>
                  <input
                    type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••" required
                    className={`input-field ${errors.password ? 'input-error' : ''}`}
                    style={{ paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#7b7a7f', display: 'flex', alignItems: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 19 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password
                  ? <p style={{ marginTop: 4, fontSize: 11, color: '#a83836', marginLeft: 2 }}>{errors.password}</p>
                  : <p style={{ marginTop: 6, fontSize: 11, color: '#7b7a7f', marginLeft: 2, lineHeight: 1.5 }}>Tối thiểu 8 ký tự, bao gồm ký tự đặc biệt.</p>
                }
              </div>

              {/* Submit */}
              <div style={{ paddingTop: 8 }}>
                <button type="submit" disabled={loading} className="gradient-btn">
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(229,255,240,0.3)', borderTopColor: '#e5fff0', display: 'inline-block' }} className="spin" />
                      Đang xử lý...
                    </>
                  ) : 'Tạo tài khoản'}
                </button>
              </div>

              {/* Divider */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(178,177,182,0.15)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#b2b1b6', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Hoặc đăng ký với</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(178,177,182,0.15)' }} />
              </div>

              {/* Social */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button type="button" className="social-btn">
                  <span className="material-symbols-outlined fill-icon" style={{ fontSize: 18 }}>g_mobiledata</span>
                  Google
                </button>
                <button type="button" className="social-btn">
                  <span className="material-symbols-outlined fill-icon" style={{ fontSize: 18 }}>passkey</span>
                  SSO
                </button>
              </div>
            </form>

            <footer style={{ marginTop: 28 }}>
              <p style={{ fontSize: 13, color: '#5f5f63', textAlign: 'center' }}>
                Đã có tài khoản?{' '}
                <Link href="/login" style={{ color: '#006d4e', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập</Link>
              </p>
              <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'center' }}>
                {['Chính sách bảo mật', 'Điều khoản dịch vụ', 'Hỗ trợ'].map(label => (
                  <a key={label} href="#" style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#b2b1b6',
                    textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s',
                  }}>{label}</a>
                ))}
              </div>
            </footer>
          </div>
        </section>
      </div>
    </>
  )
}
