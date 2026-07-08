import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Newspaper, AlertTriangle, Download, Settings, Users, LogOut, ExternalLink, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

// Mascot "O" Component (Alarm Clock Character)
const MascotO = () => (
  <svg viewBox="0 0 100 100" className="clario-mascot-o" style={{ width: '100%', height: '100%', display: 'block' }}>
    {/* Alarm bells */}
    <path d="M15 25 C15 12, 32 12, 32 25 Z" fill="#ff5e97" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
    <rect x="21" y="24" width="4" height="6" fill="#000" transform="rotate(-15 23 27)" />
    <path d="M68 25 C68 12, 85 12, 85 25 Z" fill="#ff5e97" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
    <rect x="75" y="24" width="4" height="6" fill="#000" transform="rotate(15 77 27)" />
    
    {/* Bell clappers */}
    <circle cx="23.5" cy="12" r="5" fill="#ffcc00" stroke="#000" strokeWidth="3" />
    <circle cx="76.5" cy="12" r="5" fill="#ffcc00" stroke="#000" strokeWidth="3" />
    
    {/* Legs */}
    <rect x="30" y="82" width="9" height="12" rx="4" fill="#000" />
    <rect x="61" y="82" width="9" height="12" rx="4" fill="#000" />
    
    {/* Main body circle */}
    <circle cx="50" cy="55" r="35" fill="#5d6eff" stroke="#000" strokeWidth="4.5" />
    <circle cx="48" cy="51" r="32" fill="none" stroke="#7e8eff" strokeWidth="3.5" opacity="0.4" />
    
    {/* Eyes */}
    <ellipse cx="38" cy="50" rx="7" ry="10" fill="#fff" stroke="#000" strokeWidth="3.5" />
    <ellipse cx="62" cy="50" rx="7" ry="10" fill="#fff" stroke="#000" strokeWidth="3.5" />
    {/* Pupils */}
    <circle cx="39" cy="48" r="3.5" fill="#000" />
    <circle cx="63" cy="48" r="3.5" fill="#000" />
    {/* Eye Highlights */}
    <circle cx="37" cy="45" r="1.5" fill="#fff" />
    <circle cx="61" cy="45" r="1.5" fill="#fff" />
    
    {/* Cheeks */}
    <circle cx="28" cy="60" r="3" fill="#ff5e97" opacity="0.6" />
    <circle cx="72" cy="60" r="3" fill="#ff5e97" opacity="0.6" />
    
    {/* Smile/mouth */}
    <path d="M42 66 Q50 73 58 66" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

function DashboardPage() {
  const navigate = useNavigate();
  
  // State variables for stock search
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  // Load search history from localStorage on startup
  useEffect(() => {
    const savedHistory = localStorage.getItem('search_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save symbol to localStorage history helper
  const saveToHistory = (newSymbol) => {
    const cleanSymbol = newSymbol.toUpperCase();
    if (!history.includes(cleanSymbol)) {
      const updatedHistory = [cleanSymbol, ...history].slice(0, 8); // Keep last 8 searches in sidebar
      setHistory(updatedHistory);
      localStorage.setItem('search_history', JSON.stringify(updatedHistory));
    }
  };

  // Perform research call to backend Express server using native fetch
  const handleSearch = async (searchSymbol) => {
    const targetSymbol = searchSymbol || symbol;
    if (!targetSymbol) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      // Call the API endpoint on our Express backend
      const response = await fetch('http://localhost:3000/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol: targetSymbol })
      });
      
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch research data.');
        return;
      }
      
      setReport(data);
      saveToHistory(targetSymbol);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the research server. Make sure your backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  // Export report as a clean PDF using jsPDF
  const exportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const sym = report.symbol;
    const name = report.companyName;
    const decision = report.decision;
    const analyses = report.agentAnalyses;

    // Header styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Obsidian Black
    doc.text(`CLARIO - Research Report`, 20, 25);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // Muted grey
    doc.text(`Company: ${name} (${sym})`, 20, 35);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 42);

    // Line separator
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(20, 48, 190, 48);

    // Verdict Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Investment Verdict", 20, 58);

    doc.setFontSize(12);
    doc.text(`Recommendation: ${decision.recommendation}`, 20, 68);
    doc.text(`Investment Score: ${decision.score}/100`, 20, 74);

    doc.setFont("helvetica", "normal");
    doc.text(`Reasoning: ${decision.reasoning}`, 20, 82, { maxWidth: 170 });

    doc.line(20, 95, 190, 95);

    // Agent Analysis Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("2. Agent Research Summaries", 20, 105);

    doc.setFontSize(12);
    // Financial Agent
    doc.text("💰 Financial Analyst Agent:", 20, 115);
    doc.setFont("helvetica", "normal");
    doc.text(analyses.financialAnalysis || "No financial analysis gathered.", 20, 122, { maxWidth: 170 });

    // News Agent
    doc.setFont("helvetica", "bold");
    doc.text("📰 Sentiment Analyst Agent:", 20, 155);
    doc.setFont("helvetica", "normal");
    doc.text(analyses.newsAnalysis || "No news analysis gathered.", 20, 162, { maxWidth: 170 });

    // Risk Agent
    doc.setFont("helvetica", "bold");
    doc.text("⚠️ Risk Assessment Agent:", 20, 195);
    doc.setFont("helvetica", "normal");
    doc.text(analyses.riskAnalysis || "No risk analysis gathered.", 20, 202, { maxWidth: 170 });

    // Save report
    doc.save(`${sym}_Research_Report.pdf`);
  };

  // Helper to print bullet points cleanly
  const renderBulletPoints = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
      <ul>
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[\s*\-•]+/, '').trim();
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>
    );
  };

  // Helper to format profit margin percentages
  const formatMargin = (val) => {
    if (val === 'N/A' || val === null || val === undefined) return 'N/A';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    // If it's already a whole percentage (like 15.5) or a decimal (like 0.155)
    return num < 1 && num > -1 ? `${(num * 100).toFixed(2)}%` : `${num.toFixed(2)}%`;
  };

  // Map backend Finnhub/Tavily/EDGAR fields to JSX variable names
  const companyMetrics = report?.rawData?.metrics ? {
    peRatio: report.rawData.metrics.peRatio,
    eps: report.rawData.metrics.eps,
    profitMargin: report.rawData.metrics.netProfitMargin,
    high52: report.rawData.metrics.high52Week,
    low52: report.rawData.metrics.low52Week,
  } : {};
  
  const companyNews = report?.rawData?.news || [];
  const filingData = report?.rawData?.filing || null;

  return (
    <div className="dashboard-layout">
      {/* 1. LEFT SIDEBAR: ChatGPT-Style Navigation */}
      <aside className="sidebar">
        <div className="sidebar-top">
          {/* Logo with Mascot */}
          <div className="sidebar-logo">
            <span style={{ color: '#ffcc00', WebkitTextStroke: '1.5px #000', textShadow: '2px 2px 0px #000' }}>CLARI</span>
            <div className="clario-mascot-o-container" style={{ width: '32px', height: '32px', top: '1px' }}>
              <MascotO />
            </div>
          </div>

          {/* User profile card widget */}
          <div className="profile-card">
            <div className="avatar-circle">A</div>
            <div className="profile-info">
              <span className="profile-name">Akshat Gupta</span>
              <span className="profile-email">akshat001@gmail.com</span>
            </div>
          </div>

          {/* Menu links */}
          <ul className="sidebar-menu">
            <li className="menu-item active">
              <Users size={18} />
              <span>Research Hub</span>
            </li>
          </ul>

          {/* ChatGPT-style sidebar history section */}
          {history.length > 0 && (
            <div className="history-section">
              <span className="history-title">Recent Reports</span>
              <ul className="history-list">
                {history.map((histSym) => (
                  <li
                    key={histSym}
                    className="history-item"
                    onClick={() => {
                      setSymbol(histSym);
                      handleSearch(histSym);
                    }}
                  >
                    📈 {histSym}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar Bottom Nav Link */}
        <div className="sidebar-bottom">
          <div className="menu-item" onClick={() => navigate('/')} style={{ color: 'var(--red-text)', border: '2px solid var(--border)', boxShadow: '2px 2px 0px var(--border)', backgroundColor: '#ffffff' }}>
            <LogOut size={16} />
            <span>Go to Home</span>
          </div>
        </div>
      </aside>

      {/* 2. RIGHT CONTENT AREA */}
      <main className="main-content">
        <header className="content-header">
          <h2>Research Terminal</h2>
          {report && (
            <button className="btn-neo btn-neo-dark" onClick={exportPDF}>
              <Download size={16} /> Download PDF
            </button>
          )}
        </header>

        {/* Search & Analysis Console Bar */}
        <section className="search-console-card">
          <div className="search-console-info">
            <h3>Orchestrate AI Analysis</h3>
            <p>Type in any global stock ticker to dispatch parallel analyst agents.</p>
          </div>
          <div className="search-input-group">
            <input
              type="text"
              className="neo-input"
              placeholder="e.g. AAPL, TSLA, WIT, RELIANCE"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-neo btn-neo-dark" onClick={() => handleSearch()} disabled={loading}>
              <Search size={16} />
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </section>

        {/* Error message banner */}
        {error && (
          <div style={{ padding: '16px', border: '2px solid var(--border)', background: '#fee2e2', color: '#ef4444', borderRadius: '10px', textAlign: 'center', fontWeight: 800, boxShadow: 'var(--shadow-solid)' }}>
            {error}
          </div>
        )}

        {/* Loading state spinner */}
        {loading && (
          <div className="loading-box">
            <div style={{ width: '100px', height: '100px', animation: 'spin-clockwise 6s linear infinite' }}>
              <MascotO />
            </div>
            <p style={{ fontWeight: 800, color: '#000', fontSize: '16px', marginTop: '10px' }}>
              Orchestrating agents in parallel... Please wait (~5-10s)
            </p>
          </div>
        )}

        {/* Report Output Panel */}
        {report && !loading && (
          <>
            {/* Top Row: Profile & Verdict (Left) + Financial Metrics Grid (Right) */}
            <section className="stock-profile-row">
              {/* Profile & AI Verdict Card */}
              <div className="verdict-card">
                <div className="verdict-header">
                  <div>
                    <h3 className="company-title">{report.companyName}</h3>
                    <span className="company-ticker">Ticker: {report.symbol.toUpperCase()}</span>
                  </div>
                  <span className={report.decision.recommendation === 'Invest' ? 'badge-invest' : 'badge-pass'}>
                    {report.decision.recommendation.toUpperCase()}
                  </span>
                </div>

                <div className="verdict-score-wrapper">
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verdict Score</span>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${report.decision.score}%` }}></div>
                  </div>
                  <span className="progress-score-text">{report.decision.score}/100</span>
                </div>

                <p className="verdict-reasoning">
                  <strong>Lead Analyst Reasoning:</strong> {report.decision.reasoning}
                </p>
              </div>

              {/* Financial Metrics Grid Panel */}
              <div className="metrics-card">
                <span className="metrics-title">Raw Financial Profile</span>
                <div className="metrics-grid">
                  <div className="metric-cell">
                    <span className="metric-label">P/E Ratio (TTM)</span>
                    <span className="metric-value">
                      {typeof companyMetrics.peRatio === 'number' ? companyMetrics.peRatio.toFixed(2) : companyMetrics.peRatio}
                    </span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Profit Margin</span>
                    <span className="metric-value">{formatMargin(companyMetrics.profitMargin)}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">EPS (Basic)</span>
                    <span className="metric-value">
                      {typeof companyMetrics.eps === 'number' ? companyMetrics.eps.toFixed(2) : companyMetrics.eps}
                    </span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">52-Week Range</span>
                    <span className="metric-value" style={{ fontSize: '13px', fontWeight: 900, marginTop: '6px' }}>
                      H: {typeof companyMetrics.high52 === 'number' ? `$${companyMetrics.high52.toFixed(2)}` : companyMetrics.high52}<br />
                      L: {typeof companyMetrics.low52 === 'number' ? `$${companyMetrics.low52.toFixed(2)}` : companyMetrics.low52}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Middle Row: The 3 Specialist Agent Reports */}
            <section className="bottom-section">
              <h3 className="reports-section-title">Specialist Agent Reports</h3>
              <div className="agent-grid">
                <div className="agent-card">
                  <div className="card-header">
                    <div className="card-icon-box icon-blue">
                      <TrendingUp size={18} />
                    </div>
                    <h4>Financial Analyst Agent</h4>
                  </div>
                  <div className="agent-content">
                    {renderBulletPoints(report.agentAnalyses.financialAnalysis)}
                  </div>
                </div>

                <div className="agent-card">
                  <div className="card-header">
                    <div className="card-icon-box icon-green">
                      <Newspaper size={18} />
                    </div>
                    <h4>News Sentiment Agent</h4>
                  </div>
                  <div className="agent-content">
                    {renderBulletPoints(report.agentAnalyses.newsAnalysis)}
                  </div>
                </div>

                <div className="agent-card">
                  <div className="card-header">
                    <div className="card-icon-box icon-red">
                      <AlertTriangle size={18} />
                    </div>
                    <h4>Risk Officer Agent</h4>
                  </div>
                  <div className="agent-content">
                    {renderBulletPoints(report.agentAnalyses.riskAnalysis)}
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Row: Data Sources (Articles & SEC Filing links) */}
            <section className="sources-row">
              {/* News Articles List */}
              <div className="news-card">
                <h3 className="reports-section-title" style={{ fontSize: '18px' }}>Retrieved News Sources</h3>
                <div className="news-list">
                  {companyNews && companyNews.length > 0 ? (
                    companyNews.map((article, idx) => (
                      <div key={idx} className="news-item">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="news-headline"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {article.title} <ExternalLink size={12} />
                        </a>
                        <p className="news-summary">{article.content}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent articles fetched.</p>
                  )}
                </div>
              </div>

              {/* SEC Annual Report Filing link card */}
              <div className="filing-card">
                <div className="filing-info">
                  <h3 className="reports-section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} /> SEC Annual Report (10-K)
                  </h3>
                  {filingData ? (
                    <>
                      <p className="filing-title">{filingData.title}</p>
                      <p className="filing-snippet">"{filingData.snippet}"</p>
                    </>
                  ) : (
                    <p className="filing-title" style={{ color: 'var(--text-muted)' }}>No annual filing retrieved.</p>
                  )}
                </div>
                {filingData?.secUrl && (
                  <button
                    className="btn-neo btn-neo-dark"
                    onClick={() => window.open(filingData.secUrl, '_blank')}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    View Official Document <ExternalLink size={14} />
                  </button>
                )}
              </div>
            </section>
          </>
        )}

        {/* Empty State when no search has been run */}
        {!report && !loading && (
          <div className="empty-state-box">
            <div style={{ width: '120px', height: '120px' }}>
              <MascotO />
            </div>
            <h3 style={{ margin: '12px 0 6px 0', fontSize: '20px', fontFamily: 'Outfit', fontWeight: 900 }}>Ready to Auditing?</h3>
            <p style={{ margin: 0, color: '#4b5563', maxWidth: '420px', lineHeight: 1.5 }}>
              No research reports generated yet. Enter a ticker in the console above to dispatch Clario's parallel analyst agents.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
