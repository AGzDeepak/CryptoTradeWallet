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
    console.error('Crypto AI Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#14161d] border border-slate-800 p-8 rounded-3xl space-y-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#facc15] text-slate-950 flex items-center justify-center font-extrabold text-2xl mx-auto shadow-[0_0_20px_rgba(250,204,21,0.4)]">
              !
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold font-mono text-white">Application State Reset Required</h2>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                The terminal encountered a temporary state mismatch. Click below to refresh and clear stale session cache.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3.5 rounded-xl bg-[#facc15] text-slate-950 font-extrabold font-mono text-xs uppercase tracking-wider transition hover:brightness-110 shadow-lg"
            >
              RELOAD & RESTORE TERMINAL
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
