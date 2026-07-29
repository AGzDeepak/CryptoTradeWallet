"""
CryptoBot AI — Interactive Python Terminal CLI Trading Console
Author: Deepak Kumar (@AGzDeepak)

Run this file with:
    python cli_dashboard.py
"""

import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from trading_engine import python_trading_engine
from market_generator import python_market_engine
from bot import python_quant_bot

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header(email="deepak@chainblock.io"):
    user_data = python_trading_engine.get_or_create_user(email)
    wallet = user_data["wallet"]
    
    print("=" * 70)
    print(" 🚀 CRYPTOBOT AI — PYTHON TERMINAL QUANT CONSOLE")
    print(f" 👤 User: {email} | 🆔 ID: {user_data['user']['id']}")
    print(f" 💰 Balance: ${wallet['virtualBalance']:,.2f} USDT | Equity: ${wallet['totalEquity']:,.2f} USD")
    print(f" 🤖 Bot Status: {'ACTIVE' if python_quant_bot.is_running else 'PAUSED'} | Profit: +${user_data['totalBotProfit']:,.2f}")
    print("=" * 70)

def display_menu():
    print("\n📋 MAIN MENU:")
    print(" 1. View Live Market Prices & Arbitrage Routes")
    print(" 2. Place Manual Buy / Sell Order")
    print(" 3. View Open Positions & Trade History")
    print(" 4. Deposit Funds into Wallet")
    print(" 5. Withdraw Funds (Crypto / Bank Wire)")
    print(" 6. Toggle Autopilot Arbitrage Bot")
    print(" 7. Exit Console")
    print("-" * 70)

def view_market():
    ticks = python_market_engine.generate_live_ticks()
    print("\n📈 LIVE MARKET PRICES:")
    print(f"{'SYMBOL':<10} {'PRICE (USD)':<15} {'24H HIGH':<15} {'24H LOW':<15} {'RSI':<10}")
    print("-" * 65)
    for coin in ticks["coins"]:
        rsi = coin["indicators"]["rsi"]
        print(f"{coin['symbol']:<10} ${coin['basePrice']:<14,.2f} ${coin['high24']:<14,.2f} ${coin['low24']:<14,.2f} {rsi:<10}")
    input("\nPress Enter to return to menu...")

def place_order(email):
    print("\n🛒 PLACE MANUAL ORDER:")
    symbol = input("Enter Symbol (e.g. BTCUSDT, ETHUSDT): ").strip().upper() or "BTCUSDT"
    side = input("Enter Side (BUY / SELL): ").strip().upper() or "BUY"
    amount_str = input("Enter Amount (e.g. 0.01): ").strip() or "0.01"

    try:
        amount = float(amount_str)
    except ValueError:
        print("❌ Invalid amount.")
        time.sleep(1.5)
        return

    ticks = python_market_engine.generate_live_ticks()
    coin = next((c for c in ticks["coins"] if c["symbol"] == symbol), ticks["coins"][0])
    
    res = python_trading_engine.execute_order(email, side, symbol, "Binance", amount, coin["basePrice"])
    if res["success"]:
        print(f"✅ {res['message']}")
    else:
        print(f"❌ {res['message']}")
    time.sleep(2)

def view_positions(email):
    user_data = python_trading_engine.get_or_create_user(email)
    positions = user_data["openPositions"]
    history = user_data["tradeHistory"]

    print("\n📊 OPEN POSITIONS:")
    if not positions:
        print(" (No active open positions)")
    else:
        for p in positions:
            print(f" • [{p['id']}] {p['type']} {p['amount']} {p['symbol']} @ ${p['entryBuyPrice']} (PnL: +${p['unrealizedPnL']})")

    print("\n📜 RECENT TRADE HISTORY:")
    if not history:
        print(" (No trade history recorded yet)")
    else:
        for h in history[:5]:
            print(f" • [{h['time']}] {h['symbol']} | PnL: ${h['netProfit']} ({h['result']})")

    input("\nPress Enter to return to menu...")

def deposit_funds_cli(email):
    print("\n📥 DEPOSIT FUNDS:")
    amt_str = input("Enter Deposit Amount in USDT (e.g. 1000): ").strip()
    try:
        amt = float(amt_str)
        res = python_trading_engine.deposit_funds(email, amt, "USDT")
        print(f"✅ {res['message']}")
    except ValueError:
        print("❌ Invalid deposit amount.")
    time.sleep(2)

def withdraw_funds_cli(email):
    print("\n📤 WITHDRAW FUNDS:")
    amt_str = input("Enter Withdrawal Amount in USDT: ").strip()
    addr = input("Enter Destination Address (0x...): ").strip() or "0x71C765b28F3D140a831C28190d7B41"
    try:
        amt = float(amt_str)
        res = python_trading_engine.withdraw_funds(email, amt, addr, "USDT", "Arbitrum One", "DEMO")
        if res["success"]:
            print(f"✅ {res['message']}")
        else:
            print(f"❌ {res['message']}")
    except ValueError:
        print("❌ Invalid withdrawal amount.")
    time.sleep(2)

def main():
    email = "deepak@chainblock.io"
    while True:
        clear_screen()
        print_header(email)
        display_menu()
        choice = input("Enter Choice (1-7): ").strip()

        if choice == '1':
            view_market()
        elif choice == '2':
            place_order(email)
        elif choice == '3':
            view_positions(email)
        elif choice == '4':
            deposit_funds_cli(email)
        elif choice == '5':
            withdraw_funds_cli(email)
        elif choice == '6':
            python_quant_bot.is_running = not python_quant_bot.is_running
            print(f"🤖 Bot is now {'ACTIVE' if python_quant_bot.is_running else 'PAUSED'}")
            time.sleep(1.5)
        elif choice == '7':
            print("\n👋 Exiting Python Quant Terminal. Goodbye!\n")
            sys.exit(0)

if __name__ == "__main__":
    main()
