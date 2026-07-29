"""
CryptoBot AI — Main Python Execution Entry Point
Author: Deepak Kumar (@AGzDeepak)
Stack: Python 3.14, FastAPI, Uvicorn, NumPy, BeautifulSoup4, Pydantic, Web3

Run this file with:
    python main.py
"""

import os
import sys
import time
import webbrowser
import subprocess

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def check_and_install_dependencies():
    """
    Checks and installs required Python packages automatically.
    """
    required_packages = [
        "fastapi",
        "uvicorn",
        "pydantic",
        "requests",
        "beautifulsoup4"
    ]
    
    missing = []
    for pkg in required_packages:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
            
    if missing:
        print(f"📦 Installing missing Python dependencies: {', '.join(missing)} ...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
        print("✅ Python dependencies successfully installed!\n")

def print_banner():
    print("=" * 70)
    print(" 🚀 CRYPTOBOT AI — 100% PYTHON QUANTITATIVE TRADING ENGINE")
    print(" Author: Deepak Kumar (@AGzDeepak)")
    print(" Version: 3.5.0 | Python Edition")
    print("=" * 70)
    print(" 🔹 Engine: Python 3.14 FastAPI Server & Arbitrage Bot")
    print(" 🔹 Data Feeder: Stochastic Market Pulse & Technical Indicators")
    print(" 🔹 Web Scraper: BeautifulSoup4 Live Crypto News Scraper")
    print(" 🔹 Web3 Verifier: EVM Address & Network Chain Verification")
    print(" 🔹 Datastore: Python In-Memory Ledger + Firebase Firestore")
    print("=" * 70 + "\n")

def main():
    print_banner()
    check_and_install_dependencies()

    backend_server_script = os.path.join(os.path.dirname(__file__), 'backend', 'server.py')

    print("⚡ Launching Python Quant FastAPI Engine on http://localhost:8000 ...")
    print("📖 API Interactive Documentation: http://localhost:8000/docs")
    print("🌐 Web Application Interface: http://localhost:3000/\n")

    # Automatically open local web browser after 2 seconds
    def open_browser():
        time.sleep(2)
        try:
            webbrowser.open("http://localhost:3000/")
        except Exception:
            pass

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    # Run Uvicorn Server
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True, app_dir="backend")

if __name__ == "__main__":
    main()
