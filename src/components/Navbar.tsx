import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS, PORTFOLIO_PROFILE } from '../data/portfolioData';

interface NavbarProps {
  activeSection: string;
  visible: boolean;
}

export function Navbar({ activeSection, visible }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-[#050505]/85 backdrop-blur-md border-b border-[#1f1f23]/80">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#home"
            className="text-sm md:text-[15px] font-bold tracking-[0.14em] text-white hover:text-zinc-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
          >
            {PORTFOLIO_PROFILE.fullName}
          </a>

          {/* Zone 2: 5 Single-Line Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7"
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-1 text-xs font-semibold tracking-[0.16em] uppercase transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b] ${
                    isActive
                      ? 'text-[#f0422b]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#f0422b] transition-transform duration-200 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action + Mobile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#contact"
              className={`hidden md:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase rounded-md border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b] ${
                activeSection === 'contact'
                  ? 'bg-[#f0422b] border-[#f0422b] text-white'
                  : 'bg-transparent border-[#2a2a30] text-zinc-100 hover:border-[#f0422b] hover:text-white'
              }`}
            >
              Contact
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#1f1f23] text-zinc-200 hover:text-white hover:border-zinc-600 transition-colors focus-visible:outline-2 focus-visible:outline-[#f0422b]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden bg-[#08080a]/98 backdrop-blur-lg border-b border-[#1f1f23] px-6 py-5"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`py-3 text-sm font-semibold tracking-[0.14em] uppercase transition-colors ${
                    isActive ? 'text-[#f0422b]' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href="#contact"
              onClick={handleLinkClick}
              className="mt-3 inline-flex items-center justify-center px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase rounded-md bg-[#f0422b] text-white hover:bg-[#ff553e] transition-colors"
            >
              Contact
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
