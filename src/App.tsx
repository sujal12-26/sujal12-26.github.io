/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { BreakoutSection } from './components/BreakoutSection';
import { CertificatesSection } from './components/CertificatesSection';
import { CertificatesPage } from './components/CertificatesPage';
import { ContactSection } from './components/ContactSection';
import { HeroSection } from './components/HeroSection';
import { IntroSequence } from './components/IntroSequence';
import { Navbar } from './components/Navbar';
import { ProjectsSection } from './components/ProjectsSection';
import { ProjectsPage } from './components/ProjectsPage';

function shouldSkipIntroOnLoad(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  return false;
}

const SECTION_IDS = ['home', 'about', 'certificates', 'projects', 'play', 'contact'];

function PortfolioApp() {
  const [instantStart] = useState<boolean>(() => shouldSkipIntroOnLoad());
  const [introComplete, setIntroComplete] = useState<boolean>(() => instantStart);
  const [introRunId, setIntroRunId] = useState(0);
  const [activeSection, setActiveSection] = useState('home');

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  const handleReplayIntro = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setIntroRunId((n) => n + 1);
    setIntroComplete(false);
  }, []);

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-app-ready={introComplete ? 'true' : 'false'}
      className="min-h-screen bg-[#050505] text-[#f4f4f5]"
    >
      {!introComplete && (
        <IntroSequence
          key={introRunId}
          onComplete={handleIntroComplete}
        />
      )}

      <Navbar activeSection={activeSection} visible={introComplete} />

      <main>
        <HeroSection
          ready={introComplete}
          instantSettle={instantStart && introRunId === 0}
          onReplayIntro={handleReplayIntro}
        />
        <AboutSection />
        <CertificatesSection />
        <ProjectsSection />
        <BreakoutSection />
      </main>

      <ContactSection />
    </div>
  );
}

export default function App() {
  const pathname =
    typeof window === 'undefined' ? '' : window.location.pathname.replace(/\/+$/, '');
  const hashRoute =
    typeof window === 'undefined' || !window.location.hash.startsWith('#/')
      ? ''
      : window.location.hash.slice(2).split(/[/?#]/, 1)[0];

  if (pathname.endsWith('/certificates') || hashRoute === 'certificates') {
    return <CertificatesPage />;
  }
  if (pathname.endsWith('/projects') || hashRoute === 'projects') {
    return <ProjectsPage />;
  }
  return <PortfolioApp />;
}
