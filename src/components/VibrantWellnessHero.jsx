import React, { useState } from 'react';
import { CircleUserRound, Menu, X } from 'lucide-react';

export const VibrantWellnessHero = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-white/20">
      {/* BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_082433_69699cf8-444b-4484-93cc-053e57896dfd.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* OVERLAY TINT */}
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

      {/* NAVIGATION (z-20, top) */}
      <nav className="relative z-20 flex items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8 md:px-16 lg:px-20">
        {/* Left: Custom SVG Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <svg
            className="w-8 h-8 md:w-9 md:h-9 fill-white transition-transform duration-300 group-hover:scale-105"
            viewBox="0 0 256 256"
          >
            <path d="M 128 128 C 198.692 128 256 185.308 256 256 L 151.883 256 C 149.812 220.307 120.213 192 84 192 C 47.787 192 18.188 220.307 16.117 256 L 0 256 C 0 185.308 57.308 128 128 128 Z M 104.117 0 C 106.188 35.694 135.787 64 172 64 C 208.213 64 237.812 35.694 239.883 0 L 256 0 C 256 70.692 198.692 128 128 128 C 57.308 128 0 70.692 0 0 Z" />
          </svg>
        </a>

        {/* Center: Desktop Liquid Glass Nav Pill */}
        <div className="hidden md:flex items-center space-x-8 liquid-glass rounded-full px-8 py-3">
          <a href="#home" className="text-white text-sm font-medium transition hover:text-white/90">
            Home
          </a>
          <a href="#approach" className="text-white/70 hover:opacity-100 text-sm font-medium transition-opacity">
            Our Approach
          </a>
          <a href="#methods" className="text-white/70 hover:opacity-100 text-sm font-medium transition-opacity">
            Healing Methods
          </a>
        </div>

        {/* Right: Desktop User Icon Circle */}
        <div className="hidden md:flex items-center justify-center liquid-glass h-10 w-10 rounded-full cursor-pointer transition hover:bg-white/10">
          <CircleUserRound className="h-5 w-5 text-white/80" strokeWidth={1.5} />
        </div>

        {/* Right: Mobile Menu Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="md:hidden flex items-center justify-center liquid-glass h-10 w-10 rounded-full z-50 relative"
        >
          <Menu
            className={`w-5 h-5 text-white absolute transition-all duration-300 ${
              menuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <X
            className={`w-5 h-5 text-white absolute transition-all duration-300 ${
              menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </button>
      </nav>

      {/* MOBILE MENU OVERLAY (z-10, fixed inset-0, md:hidden) */}
      <div
        className={`fixed inset-0 z-10 md:hidden bg-black/80 backdrop-blur-xl transition-all duration-500 ease-out flex flex-col items-center justify-center gap-8 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`flex flex-col items-center gap-8 transition-transform duration-500 ease-out ${
            menuOpen ? 'translate-y-0' : '-translate-y-8'
          }`}
        >
          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
            className="text-2xl font-medium text-white hover:text-white/80 transition"
          >
            Home
          </a>
          <a
            href="#approach"
            onClick={() => setMenuOpen(false)}
            className="text-2xl font-medium text-white hover:text-white/80 transition"
          >
            Our Approach
          </a>
          <a
            href="#methods"
            onClick={() => setMenuOpen(false)}
            className="text-2xl font-medium text-white hover:text-white/80 transition"
          >
            Healing Methods
          </a>

          <div className="flex items-center gap-3 mt-4">
            <div className="liquid-glass h-10 w-10 rounded-full flex items-center justify-center">
              <CircleUserRound className="h-5 w-5 text-white/80" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-light text-white/60">Account</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (z-10, flex-col, fills remaining height) */}
      <main
        className={`relative z-10 flex flex-col justify-between h-[calc(100vh-80px)] px-5 sm:px-8 md:px-16 lg:px-20 pb-8 sm:pb-12 md:pb-16 transition-opacity duration-300 ${
          menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Top Block */}
        <div className="mt-14 sm:mt-20 md:mt-28 max-w-2xl">
          {/* Badge */}
          <div className="liquid-glass rounded-full inline-flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 mb-5 sm:mb-6">
            <div className="flex -space-x-2">
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="Wellness Member 1"
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white/20 object-cover"
              />
              <img
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="Wellness Member 2"
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white/20 object-cover"
              />
              <img
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="Wellness Member 3"
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white/20 object-cover"
              />
              <img
                src="https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="Wellness Member 4"
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white/20 object-cover"
              />
            </div>
            <span className="text-xs sm:text-sm font-light text-white/80">
              our path to natural wellness
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-white tracking-[-0.05em]">
            Heal Your Body
            <br />
            Naturally
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg font-light text-white/70">
            Holistic wellness. Transformative results.
          </p>

          {/* CTA Button */}
          <button className="liquid-glass rounded-full px-6 py-3 sm:px-7 sm:py-3.5 mt-6 sm:mt-8 text-sm font-medium text-white transition duration-300 hover:bg-white/10 active:scale-95">
            Begin Your Journey
          </button>
        </div>

        {/* BOTTOM STATS */}
        <div className="flex items-end gap-6 sm:gap-10 md:gap-16">
          {/* Stat Column 1 */}
          <div className="flex flex-col">
            {/* Triangular Dot Pattern Icon (9 dots inside 20x20 box) */}
            <div className="relative w-5 h-5 mb-2">
              {/* Row 1: 1 dot at top center */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
              {/* Row 2: 3 dots */}
              <div className="absolute top-[6px] left-[2px] w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
              <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
              <div className="absolute top-[6px] right-[2px] w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
              {/* Row 3: 5 dots */}
              <div className="absolute top-[12px] left-0 w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
              <div className="absolute top-[12px] left-[4px] w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
              <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
              <div className="absolute top-[12px] right-[4px] w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
              <div className="absolute top-[12px] right-0 w-[2.5px] h-[2.5px] bg-white/60 rounded-[0.5px]" />
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-normal text-white">
              48 Hours
            </span>
            <span className="text-xs sm:text-sm font-light text-white/60">
              Initial Consultation
            </span>
          </div>

          {/* Stat Column 2 */}
          <div className="flex flex-col">
            {/* 3x3 Grid Icon of 4px rounded cells alternating bg-white/60 and bg-white/0 */}
            <div className="grid grid-cols-3 gap-[2px] w-5 h-5 mb-2">
              <div className="w-[4px] h-[4px] bg-white/60 rounded-[0.5px]" />
              <div className="w-[4px] h-[4px] bg-white/0 rounded-[0.5px]" />
              <div className="w-[4px] h-[4px] bg-white/60 rounded-[0.5px]" />
              <div className="w-[4px] h-[4px] bg-white/0 rounded-[0.5px]" />
              <div className="w-[4px] h-[4px] bg-white/60 rounded-[0.5px]" />
              <div className="w-[4px] h-[4px] bg-white/0 rounded-[0.5px]" />
              <div className="w-[4px] h-[4px] bg-white/60 rounded-[0.5px]" />
              <div className="w-[4px] h-[4px] bg-white/0 rounded-[0.5px]" />
              <div className="w-[4px] h-[4px] bg-white/60 rounded-[0.5px]" />
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-normal text-white">
              Initial Consultation
            </span>
            <span className="text-xs sm:text-sm font-light text-white/60">
              Healing Sessions
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
