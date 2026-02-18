import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Brain, Sparkles, Zap, Shield, ChevronRight, 
  BarChart3, FileSearch, HelpCircle, Cpu, 
  Globe, Rocket, Lock, Play, Terminal, 
  CheckCircle2, MousePointer2, ArrowRight, Upload,
  Users, Target, CreditCard, ChevronDown, Activity, 
  Database, Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HolographicDashboard from '../components/HolographicDashboard';
import './LandingPage.css';

export default function LandingPage() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const steps = [
    { title: "Quantum Intake", desc: "Upload your PDFs or images through our high-speed ingestion gate.", icon: <Upload size={24} /> },
    { title: "Neural Synthesis", desc: "Our AI clusters patterns across decades of data points.", icon: <Brain size={24} /> },
    { title: "Future Generation", desc: "Predictive algorithms generate high-probability exam structures.", icon: <Sparkles size={24} /> },
    { title: "Verification", desc: "Download validated answer keys and marking schemes.", icon: <CheckCircle2 size={24} /> }
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How accurate are the predictions?", a: "Our Neural Synthesis engine maintains a 94.8% accuracy rate by cross-referencing decade-long patterns with current syllabus shifts." },
    { q: "Is my data secure?", a: "Yes. All documents are encrypted at rest with AES-256 and processed in isolated sandbox environments. We never sell your data." },
    { q: "How do credits work?", a: "Each analysis or generation consumes credits. You can top up your credits anytime to continue using the quantum analysis features." },
    { q: "Can it handle handwritten notes?", a: "Our OCR Quantum engine is optimized for printed text. While it can handle some high-quality handwriting, results are best with official papers." }
  ];

  return (
    <div className="landing-container">
      {/* Sticky Navbar */}
      <nav className="landing-navbar glass">
        <div className="navbar-content">
          <div className="brand">
            <div className="brand-logo">
              <Brain size={24} />
            </div>
            <span className="brand-name-text">QuestionAI</span>
          </div>
          <div className="nav-links">
            <a href="#vision" className="nav-link">Neural Vision</a>
            <a href="#how-it-works" className="nav-link">The Process</a>
            <a href="#terminal" className="nav-link">Terminal</a>
            <Link to={user ? "/dashboard" : "/auth"} className="btn-nav">
              {user ? "Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      </nav>

      <div className="landing-container-main">
        {/* Cinematic Video Background */}
        <div className="video-background-layer">
          <iframe
            className="video-bg-iframe"
            src="https://www.youtube.com/embed/khVfTDZQ7FY?autoplay=1&mute=1&controls=0&loop=1&playlist=khVfTDZQ7FY&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            title="Background Video"
          ></iframe>
          <div className="video-overlay"></div>
          <div className="scanlines"></div>
        </div>

        {/* Main Content */}
        <div className="content-wrapper">
          {/* Hero Section */}
          <section className="hero">
            <motion.div 
              className="hero-content"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="hero-badge">
                <Sparkles size={14} className="sparkle-icon" />
                <span>THE FUTURE OF EXAM PREP IS HERE</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="hero-title">
                Predicting the <span className="glitch-text" data-text="UNPREDICTABLE">UNPREDICTABLE</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="hero-subtitle">
                Harness the power of Neural Networks to decode academic patterns. 
                Upload past papers and get AI-generated predictions with 95% accuracy.
              </motion.p>
              
              <motion.div variants={itemVariants} className="hero-actions">
                <Link to={user ? "/dashboard" : "/auth"} className="btn btn-glow btn-lg">
                  Enter Dashboard <Rocket size={18} />
                </Link>
                <a href="#vision" className="btn btn-glass btn-lg">
                  Our Vision
                </a>
              </motion.div>
            </motion.div>

            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <HolographicDashboard />
            </motion.div>

          </section>

          {/* Stats Section */}
          <section className="stats-grid">
            <div className="stat-box glass">
              <div className="stat-val">1.2M+</div>
              <div className="stat-lab">Questions Analyzed</div>
            </div>
            <div className="stat-box glass">
              <div className="stat-val">94.8%</div>
              <div className="stat-lab">Prediction Accuracy</div>
            </div>
            <div className="stat-box glass">
              <div className="stat-val">50K+</div>
              <div className="stat-lab">Students Helped</div>
            </div>
            <div className="stat-box glass">
              <div className="stat-val">0.4s</div>
              <div className="stat-lab">Processing Speed</div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="process-section">
            <div className="section-header center">
              <h2 className="title-gradient">The Ingestion Pipeline</h2>
              <p>From raw data to predictive insights in milliseconds.</p>
            </div>

            <div className="process-flow">
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  className="process-step"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                >
                  <div className="step-icon-gate">
                    {step.icon}
                    <div className="gate-glow"></div>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  {idx < steps.length - 1 && <div className="step-connector"><ArrowRight size={20} /></div>}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Terminal Preview Section */}
          <section id="terminal" className="terminal-section">
            <div className="section-header center">
              <h2 className="title-gradient">Beyond the Interface</h2>
              <p>Experience the raw power of our Neural Engine in real-time.</p>
            </div>
            <motion.div 
              className="terminal-window glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="terminal-header">
                <div className="dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="title">
                  <Terminal size={14} />
                  <span>neural_engine.sh</span>
                </div>
              </div>
              <div className="terminal-body">
                <div className="line">
                  <span className="prompt">$</span> 
                  <span className="terminal-cmd">analyze --input ./exam_paper_2025.pdf</span>
                </div>
                <div className="line success">[INFO] Ingesting PDF via Quantum OCR...</div>
                <div className="line">[INFO] Identifying pattern clusters (2014-2025)...</div>
                <div className="line warning">[WARN] Unusual syllabus shift detected in Section C.</div>
                <div className="line success">[SUCCESS] Neural synthesis complete. Accuracy: 94.8%</div>
                <div className="line pulse">Predicting 2026 question structure... _</div>
              </div>
            </motion.div>
          </section>
          {/* Feature Deep Dive Section */}
          <section className="deep-dive-section">
            <div className="section-header">
              <h2 className="title-gradient">The Architecture of Certainty</h2>
              <p>Go beyond simple text extraction with our multi-layered analysis stack.</p>
            </div>
            <div className="deep-dive-grid">
              <div className="deep-dive-card glass">
                <div className="card-top">
                  <Fingerprint className="card-icon" />
                  <h3>OCR Quantum</h3>
                </div>
                <p>Sub-millimeter text extraction even from poor scans. Handles complex mathematical formulas and diagrams with native AI vision.</p>
                <ul className="card-list">
                  <li>LaTeX Formula Recognition</li>
                  <li>Diagram Vectorization</li>
                  <li>Auto-Rotation Correction</li>
                </ul>
              </div>
              <div className="deep-dive-card glass">
                <div className="card-top">
                  <Activity className="card-icon" />
                  <h3>Neural Synthesis</h3>
                </div>
                <p>Clusters data points across 10+ years of institutional files. Identifies the "hidden curriculum" that standard study methods miss.</p>
                <ul className="card-list">
                  <li>Topic Recurrence Weighting</li>
                  <li>Semantic Difficulty Mapping</li>
                  <li>Trend Velocity Analysis</li>
                </ul>
              </div>
              <div className="deep-dive-card glass">
                <div className="card-top">
                  <Database className="card-icon" />
                  <h3>Data Persistence</h3>
                </div>
                <p>Your institutional knowledge is stored in high-performance vectorized databases for instant cross-analysis and comparison.</p>
                <ul className="card-list">
                  <li>Secure Cloud Vault</li>
                  <li>Instant Retrieval</li>
                  <li>Version Control</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="use-cases-section">
            <div className="section-header center">
              <h2 className="title-gradient">Mission Critical Scenarios</h2>
            </div>
            <div className="use-case-split">
              <div className="use-case-box student glass-glow">
                <div className="box-header">
                  <Users size={32} />
                  <h3>For Students</h3>
                </div>
                <p>Cut your study time by 60%. Focus only on concepts with the highest probability of appearance in your upcoming finals.</p>
                <div className="box-footer">
                  <span className="badge">Boost Rank</span>
                  <span className="badge">Save Time</span>
                </div>
              </div>
              <div className="use-case-box educator glass-glow">
                <div className="box-header">
                  <Target size={32} />
                  <h3>For Educators</h3>
                </div>
                <p>Identify syllabus gaps and generate high-quality practice papers that mirror actual exam difficulty and structure.</p>
                <div className="box-footer">
                  <span className="badge">Syllabus Audit</span>
                  <span className="badge">Paper Gen</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="pricing-section">
            <div className="section-header center">
              <h2 className="title-gradient">Fuel Your Analysis</h2>
              <p>Simple, transparent credit bundles for every academic need.</p>
            </div>
            <div className="pricing-grid">
              {[
                { tier: "Micro", credits: 10, price: "$4.99", desc: "Perfect for single subject finals." },
                { tier: "Standard", credits: 50, price: "$19.99", desc: "Full semester coverage for most students.", popular: true },
                { tier: "Pro", credits: 150, price: "$49.99", desc: "The ultimate edge for entire academic years." }
              ].map((p, i) => (
                <div key={i} className={`price-card glass ${p.popular ? 'popular' : ''}`}>
                  {p.popular && <div className="popular-badge">COUPON: %OFF</div>}
                  <h4>{p.tier}</h4>
                  <div className="price-val">{p.price}</div>
                  <div className="credit-count">{p.credits} Analysis Credits</div>
                  <p>{p.desc}</p>
                  <button className={`btn ${p.popular ? 'btn-glow' : 'btn-glass'} btn-block`}>Buy Credits</button>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="faq-section">
            <div className="section-header">
              <h2 className="title-gradient">Protocol Q&A</h2>
            </div>
            <div className="faq-accordion">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`faq-item glass ${activeFaq === idx ? 'active' : ''}`}
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <div className="faq-q">
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className="faq-icon" />
                  </div>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div 
                        className="faq-a"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="cta-section">
            <div className="cta-card glass-glow">
              <h2>Ready to decode the future?</h2>
              <p>Join thousands of students who have gained the competitive edge.</p>
              <div className="cta-actions">
                <Link to={user ? "/dashboard" : "/auth"} className="btn btn-glow btn-xl">
                  Start Analyzing Now <Rocket size={20} />
                </Link>
              </div>
              <div className="cta-background-fx"></div>
            </div>
          </section>

          {/* Footer */}
          <footer className="future-footer">
            <div className="footer-line"></div>
            <div className="footer-content">
              <div className="brand">
                <Brain className="b-icon" />
                <span>QuestionAI // 2026</span>
              </div>
              <div className="footer-links">
                <span>Security</span>
                <span>API</span>
                <span>Github</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
