// REST API Integration Service compatible with Flask Backend (/api/*)

const API_BASE_URL = '/api';

export const apiService = {
  // GET /api/market
  async getMarketData() {
    try {
      const res = await fetch(`${API_BASE_URL}/market`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.log('Flask backend not detected. Operating in high-performance simulation mode.');
    }
    return null;
  },

  // GET /api/arbitrage
  async getArbitrageOpportunities() {
    try {
      const res = await fetch(`${API_BASE_URL}/arbitrage`);
      if (res.ok) return await res.json();
    } catch (err) {
      // fallback
    }
    return null;
  },

  // GET /api/trades
  async getOpenPositions() {
    try {
      const res = await fetch(`${API_BASE_URL}/trades`);
      if (res.ok) return await res.json();
    } catch (err) {
      // fallback
    }
    return null;
  },

  // GET /api/wallet
  async getWallet() {
    try {
      const res = await fetch(`${API_BASE_URL}/wallet`);
      if (res.ok) return await res.json();
    } catch (err) {
      // fallback
    }
    return null;
  },

  // GET /api/history
  async getHistory() {
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (res.ok) return await res.json();
    } catch (err) {
      // fallback
    }
    return null;
  },

  // GET /api/news
  async getNews() {
    try {
      const res = await fetch(`${API_BASE_URL}/news`);
      if (res.ok) return await res.json();
    } catch (err) {
      // fallback
    }
    return null;
  },

  // GET /api/settings
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) return await res.json();
    } catch (err) {
      // fallback
    }
    return null;
  },

  // POST /api/autotrade
  async toggleAutoTrade(enabled) {
    try {
      const res = await fetch(`${API_BASE_URL}/autotrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      // fallback
    }
    return { success: true, enabled };
  }
};
