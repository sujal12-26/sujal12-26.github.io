import { ArrowLeft } from 'lucide-react';
import { ALL_CERTIFICATES } from '../data/certificates';
import { CertificateCard } from './CertificateCard';

export function CertificatesPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#f4f4f5]">
      <header className="border-b border-[#1f1f23]">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <a
            href="/"
            className="text-sm md:text-[15px] font-bold tracking-[0.14em] text-white hover:text-zinc-300 transition-colors"
          >
            SUJAL PATEL
          </a>
          <a
            href="/#certificates"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#f0422b]" aria-hidden="true" />
            Back to portfolio
          </a>
        </div>
      </header>

      <section className="py-16 md:py-24">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10">
          <div className="mb-10 md:mb-14">
            <div className="flex items-center gap-3 mb-3">
              <span aria-hidden="true" className="w-6 h-[2px] bg-[#f0422b]" />
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-400">
                Courses &amp; Learning
              </span>
            </div>
            <h1 className="metallic-text text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold tracking-[-0.035em] leading-[0.96]">
              ALL CERTIFICATES
            </h1>
            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-400">
              A collection of completed courses and learning certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {ALL_CERTIFICATES.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
