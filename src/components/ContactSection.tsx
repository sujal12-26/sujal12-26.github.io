import { ArrowUp, Linkedin, Mail } from 'lucide-react';
import { PORTFOLIO_PROFILE } from '../data/portfolioData';

export function ContactSection() {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="contact"
      className="relative scroll-mt-16 bg-[#050505] pt-24 md:pt-36 pb-12 border-t border-[#1f1f23]/60"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#f0422b] mb-3">
              Contact
            </p>
            <h2 className="metallic-text text-[clamp(2.5rem,6vw,4rem)] font-extrabold uppercase tracking-[-0.035em] leading-[0.96]">
              GET IN TOUCH
            </h2>
          </div>

          <div className="rounded-xl bg-[#0c0c0e] border border-[#1f1f23] divide-y divide-[#1f1f23]">
            <div className="p-6">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                Email
              </p>
              <a
                href={`mailto:${PORTFOLIO_PROFILE.email}`}
                className="mt-2 inline-block text-base sm:text-lg font-medium text-white hover:text-[#f0422b] transition-colors break-all"
              >
                {PORTFOLIO_PROFILE.email}
              </a>
            </div>

            <div className="p-6">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                Based in
              </p>
              <p className="mt-2 text-base font-medium text-zinc-100">
                {PORTFOLIO_PROFILE.location}
              </p>
            </div>

            <div className="p-6">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                Focus
              </p>
              <p className="mt-2 text-base font-medium text-zinc-100">
                {PORTFOLIO_PROFILE.focus}
              </p>
            </div>

            <div className="p-6">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-3">
                Connect
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${PORTFOLIO_PROFILE.email}`}
                  aria-label="Email Sujal"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#27272c] text-zinc-300 hover:text-white hover:border-[#f0422b] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/sujal-patel-238024422/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn profile"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#27272c] text-zinc-300 hover:text-white hover:border-[#f0422b] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-[#1f1f23] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Sujal Patel. All rights reserved.</p>
          <button
            type="button"
            onClick={handleScrollTop}
            className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded focus-visible:outline-2 focus-visible:outline-[#f0422b]"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#f0422b]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
