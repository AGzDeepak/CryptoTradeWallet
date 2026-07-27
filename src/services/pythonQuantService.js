/**
 * Python FastAPI Backend Service Bridge for CryptoBot AI
 */

const PYTHON_API_BASE = 'http://localhost:8000';

export const fetchPythonHealth = async () => {
  try {
    const res = await fetch(`${PYTHON_API_BASE}/api/health`);
    if (!res.ok) throw new Error('Python API Offline');
    return await res.json();
  } catch (err) {
    console.warn('[PYTHON API NOTICE] Using client-side quant fallback:', err.message);
    return null;
  }
};

export const fetchPythonMarketPrices = async () => {
  try {
    const res = await fetch(`${PYTHON_API_BASE}/api/market/prices`);
    if (!res.ok) throw new Error('Python API Error');
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const requestPythonWithdrawal = async (withdrawPayload) => {
  try {
    const res = await fetch(`${PYTHON_API_BASE}/api/wallet/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(withdrawPayload)
    });
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Python Withdrawal Failed');
    }
    
    return await res.json();
  } catch (err) {
    console.warn('[PYTHON WITHDRAW NOTICE] Python backend error or fallback:', err.message);
    return null;
  }
};
