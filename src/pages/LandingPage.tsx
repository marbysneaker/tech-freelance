import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-title">IT Task Manager</h1>
          <p className="landing-subtitle">
            Streamline your IT support operations. Submit tickets, track progress, and
            resolve issues faster — all in one place.
          </p>
          <div className="landing-cta">
            <button className="btn primary landing-btn" onClick={() => navigate('/login')}>
              Get Started
            </button>
            <button className="btn landing-btn-outline" onClick={() => navigate('/login', { state: { view: 'signup' } })}>
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2 className="landing-section-title">Everything you need to manage IT tasks</h2>
        <div className="landing-cards">
          <div className="landing-card">
            <div className="landing-card-icon">🎫</div>
            <h3>Submit Tickets</h3>
            <p>Quickly report IT issues with category, location, and description. Get confirmation instantly.</p>
          </div>
          <div className="landing-card">
            <div className="landing-card-icon">📋</div>
            <h3>Track Progress</h3>
            <p>Monitor your tickets from open to completed. Stay informed at every step of the resolution process.</p>
          </div>
          <div className="landing-card">
            <div className="landing-card-icon">🔧</div>
            <h3>Tech Assignment</h3>
            <p>Technicians can claim and manage their assigned work orders with a clear, organized dashboard.</p>
          </div>
          <div className="landing-card">
            <div className="landing-card-icon">📊</div>
            <h3>Admin Overview</h3>
            <p>Administrators get full visibility into all tickets, team workload, and resolution statistics.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-steps">
        <h2 className="landing-section-title">How it works</h2>
        <div className="landing-step-list">
          <div className="landing-step">
            <div className="landing-step-num">1</div>
            <div>
              <h4>Create an account</h4>
              <p>Sign up with your email and choose your role — user, technician, or administrator.</p>
            </div>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">2</div>
            <div>
              <h4>Submit a ticket</h4>
              <p>Describe the IT issue, select a category and location, and submit in seconds.</p>
            </div>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">3</div>
            <div>
              <h4>Get it resolved</h4>
              <p>A technician is assigned, works on the issue, and marks it complete — you're notified at each stage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="landing-footer-cta">
        <h2>Ready to simplify your IT support?</h2>
        <button className="btn primary landing-btn" onClick={() => navigate('/login')}>
          Sign In or Sign Up
        </button>
      </section>
    </div>
  );
}
