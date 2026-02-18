import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, BarChart3, Zap, Shield, Globe } from 'lucide-react';

const HolographicDashboard = () => {
  const stats = [
    { label: "Neural Load", value: "84.2%", icon: <Activity size={16} />, color: "#6366f1" },
    { label: "Pattern Match", value: "94.8%", icon: <Target size={16} />, color: "#a855f7" },
    { label: "Quantum Sync", value: "1.2ms", icon: <Zap size={16} />, color: "#22d3ee" }
  ];

  return (
    <div className="holographic-wrapper">
      <motion.div 
        className="holographic-container"
        initial={{ rotateY: -25, rotateX: -10, opacity: 1, y: 0 }}
        animate={{ 
          rotateY: [-25, -28, -25], 
          rotateX: [-10, -13, -10], 
          y: [0, -15, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Main Grid Card */}
        <div className="holo-card main glass">
          <div className="holo-header">
            <Globe className="holo-icon" size={20} />
            <span>GLOBAL_SYSTEM_STATUS</span>
            <div className="live-indicator">
              <div className="ping"></div>
              <span>LIVE</span>
            </div>
          </div>
          
          <div className="holo-grid">
            <div className="grid-line horizontal"></div>
            <div className="grid-line vertical"></div>
            {/* Simulated Data Points */}
            {[...Array(12)].map((_, i) => (
              <motion.div 
                key={i} 
                className="data-point"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: Math.random() * 4 + 3, repeat: Infinity }}
              ></motion.div>
            ))}
          </div>

          <div className="holo-stats">
            {stats.map((stat, idx) => (
              <div key={idx} className="holo-stat-item">
                <div className="stat-label">
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Peripheral Cards */}
        <motion.div 
          className="holo-card side glass"
          animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="mini-header">
            <Shield size={14} /> 
            <span>SECURE_ENCLAVE</span>
          </div>
          <div className="encryption-anim">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </motion.div>

        <motion.div 
          className="holo-card bottom glass"
          animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="mini-header">
            <Brain size={14} /> 
            <span>NEURAL_ENGINE</span>
          </div>
          <div className="loading-bar">
            <motion.div 
              className="bar-fill"
              animate={{ width: ["10%", "90%", "40%", "85%"] }}
              transition={{ duration: 10, repeat: Infinity }}
            ></motion.div>
          </div>
        </motion.div>

        {/* Neural Network Connection Lines Style */}
        <div className="neural-lines">
          <svg width="100%" height="100%" viewBox="0 0 400 400">
            <motion.path 
              d="M 50 100 Q 200 50 350 150" 
              fill="transparent" 
              stroke="rgba(99, 102, 241, 0.5)" 
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0.8 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                pathLength: { duration: 3, ease: "easeOut" }
              }}
            />
            <motion.path 
              d="M 100 300 Q 250 350 380 200" 
              fill="transparent" 
              stroke="rgba(34, 211, 238, 0.5)" 
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0.8 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                pathLength: { duration: 4, ease: "easeOut", delay: 1 }
              }}
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

// Internal Lucide alias fix for Target icon which was missing in imports
const Target = ({ size, color }: { size: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export default HolographicDashboard;
