import { ArrowUpRight } from 'lucide-react';
import { FEATURED_CERTIFICATES } from '../data/certificates';
import { CertificateCard } from './CertificateCard';

export function CertificatesSection() {
  return (
    <section
      id="certificates"
      className="relative scroll-mt-16 bg-[#050505] py-24 md:py-36 border-t border-[#1f1f23]/60"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden="true" className="w-6 h-[2px] bg-[#f0422b]" />
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-400">
              Learning Milestones
            </span>
          </div>
          <h2 className="metallic-text text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold tracking-[-0.035em] leading-[0.96]">
            CERTIFICATES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {FEATURED_CERTIFICATES.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={`${import.meta.env.BASE_URL}#/certificates`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-[#27272c] bg-[#0c0c0e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
          >
            View All Certificates
            <ArrowUpRight className="h-4 w-4 text-[#f0422b]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
