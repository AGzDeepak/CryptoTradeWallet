import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Crypto AI Fatal Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-[#14161d] border border-rose-500/40 p-8 rounded-3xl space-y-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-extrabold text-2xl mx-auto shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              ⚠️
            </div>
            <div className="space-y-3 font-mono text-left bg-black/60 p-4 rounded-2xl border border-slate-800 text-xs overflow-x-auto">
              <h3 className="text-rose-400 font-extrabold text-sm uppercase">Application Error Detected:</h3>
              <p className="text-slate-200 font-bold">{this.state.error?.toString()}</p>
              <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">{this.state.error?.stack}</pre>
            </div>
            <button
              onClick={() => {
                try { localStorage.clear(); } catch (_) {}
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold font-mono text-xs uppercase tracking-wider transition shadow-lg"
            >
              CLEAR STALE CACHE & RELOAD TERMINAL
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
