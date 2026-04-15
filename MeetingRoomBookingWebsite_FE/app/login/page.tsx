'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginApi, saveToken, saveUser } from '@/lib/authService'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginApi({ email, password })
      if (res.success && res.data) {
        saveToken(res.data.token)
        saveUser(res.data.user)
        router.push(res.data.user.role === 'admin' ? '/admin' : '/booking')
      } else {
        setError(res.message || 'Email hoặc mật khẩu không đúng')
      }
    } catch {
      setError('Không thể kết nối server')
    } finally {
      setLoading(false)
    }
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

        .blob-1 {
          position: absolute; top: -10%; right: -10%;
          width: 75%; height: 75%; border-radius: 50%;
          background: rgba(112, 248, 194, 0.08);
          filter: blur(120px);
        }
        .blob-2 {
          position: absolute; bottom: -5%; left: -5%;
          width: 55%; height: 55%; border-radius: 50%;
          background: rgba(207, 233, 218, 0.18);
          filter: blur(100px);
        }
        .glass-tag {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
        }
        .input-field {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: #f5f3f6;
          border: 1.5px solid transparent;
          border-radius: 14px;
          font-size: 14px;
          color: #323236;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          outline: none;
        }
        .input-field::placeholder { color: #b2b1b6; }
        .input-field:focus {
          background: #fff;
          border-color: #006d4e;
          box-shadow: 0 0 0 4px rgba(0,109,78,0.08);
        }
        .primary-btn {
          width: 100%;
          padding: 15px 24px;
          background: #006d4e;
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
          box-shadow: 0 4px 14px rgba(0,109,78,0.18);
        }
        .primary-btn:hover { opacity: 0.92; transform: translateY(-1px); }
        .primary-btn:active { transform: scale(0.98); }
        .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .social-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 13px 16px;
          background: #fff;
          border: 1.5px solid rgba(178,177,182,0.15);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          color: #323236;
          cursor: pointer;
          transition: background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .social-btn:hover { background: #f5f3f6; }
        .stat-divider { width: 1px; height: 36px; background: rgba(178,177,182,0.3); }
        .fade-in { animation: fadeUp 0.5s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="vcb-root" style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
        {/* ── LEFT BRAND PANEL ── */}
        <section style={{
          display: 'none',
          position: 'relative',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: '#fcf8fb',
          overflow: 'hidden',
          flex: '0 0 50%',
        }} className="lg-flex">
          <style>{`
            @media (min-width: 1024px) { .lg-flex { display: flex !important; } }
          `}</style>

          <div className="blob-1" />
          <div className="blob-2" />

          {/* Brand Header */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, background: '#006d4e',
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined fill-icon" style={{ color: '#fff', fontSize: 20 }}>meeting_room</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#323236' }}>Viên Chi Bảo</span>
            </div>
          </div>

          {/* Editorial Headline */}
          <div style={{ position: 'relative', zIndex: 10, maxWidth: 440 }}>
            <h1 className="vcb-serif" style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              color: '#323236',
              marginBottom: 24,
              fontWeight: 400,
            }}>
              Không gian họp<br />
              được thiết kế cho<br />
              <em style={{ color: '#006d4e', fontStyle: 'italic' }}>hiệu suất.</em>
            </h1>
            <p style={{ fontSize: 15, color: '#5f5f63', lineHeight: 1.65, maxWidth: 380 }}>
              Hệ thống đặt phòng thông minh dành cho đội ngũ năng động. Quản lý không gian làm việc với sự minh bạch tuyệt đối.
            </p>
          </div>

          {/* Stats */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 32 }}>
            {[
              { label: 'Phòng họp', val: '2' },
              { label: 'Uptime', val: '99.9%' },
              { label: 'Bảo mật', val: 'E2E' },
            ].map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                {i > 0 && <div className="stat-divider" />}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#b2b1b6', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#323236' }}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative image */}
          <div style={{
            position: 'absolute', right: 0, bottom: 0,
            width: '55%', height: '45%', opacity: 0.35,
            mixBlendMode: 'multiply',
          }}>
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=70"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }}
            />
          </div>
        </section>

        {/* ── RIGHT FORM PANEL ── */}
        <section style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          background: '#f5f3f6',
        }}>
          <div className="fade-in" style={{
            width: '100%', maxWidth: 420,
            background: '#fff',
            borderRadius: 24,
            padding: '40px',
            boxShadow: '0 12px 40px rgba(50,50,54,0.05)',
            border: '1px solid rgba(178,177,182,0.1)',
          }}>
            {/* Mobile brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }} className="mobile-brand">
              <style>{`@media (min-width: 1024px) { .mobile-brand { display: none !important; } }`}</style>
              <div style={{ width: 34, height: 34, background: '#006d4e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined fill-icon" style={{ color: '#fff', fontSize: 18 }}>meeting_room</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#323236' }}>Viên Chi Bảo</span>
            </div>

            <header style={{ marginBottom: 32 }}>
              <h2 className="vcb-serif" style={{ fontSize: 26, fontWeight: 400, color: '#323236', marginBottom: 6, letterSpacing: '-0.01em' }}>
                Chào mừng trở lại
              </h2>
              <p style={{ fontSize: 13, color: '#5f5f63' }}>Truy cập workspace và quản lý phê duyệt của bạn.</p>
            </header>

            {error && (
              <div style={{
                marginBottom: 20, padding: '12px 16px',
                background: 'rgba(168,56,54,0.06)',
                border: '1px solid rgba(168,56,54,0.15)',
                borderRadius: 12, fontSize: 13, color: '#a83836', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#5f5f63', textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 }}>
                  Email công việc
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#7b7a7f' }}>alternate_email</span>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@vienchibao.vn" required
                    className="input-field"
                    style={{ paddingLeft: 48 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#5f5f63', textTransform: 'uppercase', marginLeft: 2 }}>
                    Mật khẩu
                  </label>
                  <a href="#" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: '#006d4e', textDecoration: 'none', textTransform: 'uppercase' }}>
                    Quên?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#7b7a7f' }}>lock</span>
                  <input
                    type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="input-field"
                    style={{ paddingLeft: 48, paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#7b7a7f', display: 'flex', alignItems: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div style={{ paddingTop: 4 }}>
                <button type="submit" disabled={loading} className="primary-btn">
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(229,255,240,0.3)', borderTopColor: '#e5fff0', display: 'inline-block' }} className="spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Truy cập Workspace
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(178,177,182,0.2)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#b2b1b6', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Hoặc đăng nhập với</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(178,177,182,0.2)' }} />
              </div>

              {/* Social */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button type="button" className="social-btn">
                  <span className="material-symbols-outlined fill-icon" style={{ fontSize: 20 }}>g_mobiledata</span>
                  Google
                </button>
                <button type="button" className="social-btn">
                  <span className="material-symbols-outlined fill-icon" style={{ fontSize: 20 }}>passkey</span>
                  SSO
                </button>
              </div>
            </form>

            <footer style={{ marginTop: 28, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#5f5f63' }}>
                Chưa có tài khoản?{' '}
                <Link href="/register" style={{ color: '#006d4e', fontWeight: 600, textDecoration: 'none' }}>
                  Yêu cầu truy cập
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </div>

      {/* Floating E2E tag */}
      <div className="glass-tag" style={{
        position: 'fixed', bottom: 28, right: 28,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 999,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        pointerEvents: 'none',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B080' }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#5f5f63', textTransform: 'uppercase' }}>E2E Encryption Active</span>
      </div>
    </>
  )
}
