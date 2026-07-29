/**
 * REST API Integration Service connected to Python 3.14 FastAPI Engine (http://localhost:8000/api/*)
 * Safely integrates React frontend with Python Quant Backend.
 */

const PYTHON_API_BASE_URL = 'http://localhost:8000/api';

export const apiService = {
  // GET /api/health
  async getPythonEngineHealth() {
    try {
      const res = await fetch(`${PYTHON_API_BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Python FastAPI engine notice — using local client state fallback:', err?.message);
    }
    return null;
  },

  // GET /api/user/workspace
  async getUserWorkspace(email = 'deepak@chainblock.io', name = 'Deepak Kumar') {
    try {
      const res = await fetch(`${PYTHON_API_BASE_URL}/user/workspace?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Python FastAPI workspace fetch notice:', err?.message);
    }
    return null;
  },

  // POST /api/wallet/deposit
  async depositPythonWallet(email, amount, currency = 'USDT') {
    try {
      const res = await fetch(`${PYTHON_API_BASE_URL}/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount, currency })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Python FastAPI deposit notice:', err?.message);
    }
    return null;
  },

  // POST /api/wallet/withdraw
  async withdrawPythonWallet(email, name, amount, currency, destinationAddress, networkChain, walletMode) {
    try {
      const res = await fetch(`${PYTHON_API_BASE_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, amount, currency, destinationAddress, networkChain, walletMode })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Python FastAPI withdraw notice:', err?.message);
    }
    return null;
  },

  // POST /api/trade/execute
  async executePythonOrder(email, side, symbol, exchange, amount, currentPrice) {
    try {
      const res = await fetch(`${PYTHON_API_BASE_URL}/trade/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, side, symbol, exchange, amount, currentPrice })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Python FastAPI trade order notice:', err?.message);
    }
    return null;
  },

  // POST /api/trade/close
  async closePythonPosition(email, positionId, finalPnL = null) {
    try {
      const res = await fetch(`${PYTHON_API_BASE_URL}/trade/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, positionId, finalPnL })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Python FastAPI close position notice:', err?.message);
    }
    return null;
  },

  // POST /api/bot/auto-trade
  async runPythonAutoTrade(email, opp) {
    try {
      const res = await fetch(`${PYTHON_API_BASE_URL}/bot/auto-trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, opp })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Python FastAPI auto-trade notice:', err?.message);
    }
    return null;
  },

  // GET /api/news/scrape
  async getScrapedNews() {
    try {
      const res = await fetch(`${PYTHON_API_BASE_URL}/news/scrape`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Python BeautifulSoup news scraper notice:', err?.message);
    }
    return null;
  }
};
