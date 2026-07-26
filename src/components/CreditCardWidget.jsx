import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { CreditCard, Cpu } from 'lucide-react';

export const CreditCardWidget = () => {
  const { wallet, openModal } = useCrypto();

  return (
    <div
      onClick={() => openModal('WALLET')}
      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 rounded-2xl shadow-xl border border-blue-400/30 flex flex-col justify-between h-44 text-white font-mono cursor-pointer hover:scale-[1.01] transition duration-200 relative overflow-hidden"
    >
      {/* Background Glow Overlay */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header: Type + Gold Chip */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase text-blue-100 font-sans">Credit Card</span>
        <div className="w-9 h-7 rounded-md bg-amber-400/90 border border-amber-300 flex items-center justify-center shadow-md">
          <Cpu className="w-4 h-4 text-amber-950" />
        </div>
      </div>

      {/* Card Number */}
      <div className="text-lg sm:text-xl font-bold tracking-[0.2em] my-auto text-white shadow-sm">
        3475 7381 3759 4512
      </div>

      {/* Card Footer: Holder Name + VISA Logo */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] text-blue-200 block leading-none font-sans uppercase">Card Holder</span>
          <span className="text-xs font-extrabold tracking-wider text-white">DARRELL STEWARD</span>
        </div>
        <span className="text-xl font-black italic tracking-tighter text-white">VISA</span>
      </div>
    </div>
  );
};
