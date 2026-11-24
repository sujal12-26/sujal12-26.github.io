import { ArrowUpRight } from 'lucide-react';
import type { CertificateItem } from '../data/certificates';

export function CertificateCard({
  certificate,
}: {
  certificate: CertificateItem;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#27272c] bg-[#0c0c0e]">
      <a
        href={certificate.file}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${certificate.title} certificate PDF`}
        className="group block aspect-[4/3] overflow-hidden bg-white p-2 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#f0422b]"
      >
        <img
          src={certificate.image}
          alt={`${certificate.title} certificate preview`}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]"
        />
      </a>

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#f0422b]">
            {certificate.provider}
          </span>
          {certificate.completedOn && (
            <span className="shrink-0 text-[11px] text-zinc-500">
              {certificate.completedOn}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug text-zinc-100">
          {certificate.title}
        </h3>
        <p className="mt-2 min-h-12 text-sm leading-relaxed text-zinc-400">
          {certificate.description}
        </p>
        {certificate.documents ? (
          <div className="mt-5 space-y-2 border-t border-[#1f1f23] pt-4">
            {certificate.documents.map((document) => (
              <a
                key={document.file}
                href={document.file}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 text-xs font-semibold text-zinc-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
              >
                <span>{document.label}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[#f0422b]" aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : (
          <a
            href={certificate.file}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
          >
            View Certificate PDF
            <ArrowUpRight className="h-4 w-4 text-[#f0422b]" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
