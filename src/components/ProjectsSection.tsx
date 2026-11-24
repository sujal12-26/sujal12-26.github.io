import { ArrowUpRight } from 'lucide-react';
import { FEATURED_PROJECTS, PROJECTS } from '../data/projects';
import { ProjectGallery } from './ProjectGallery';

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative scroll-mt-16 bg-[#050505] py-24 md:py-36 border-t border-[#1f1f23]/60"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden="true" className="w-6 h-[2px] bg-[#f0422b]" />
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-400">
              Selected Work
            </span>
          </div>
          <h2 className="metallic-text text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold tracking-[-0.035em] leading-[0.96]">
            PROJECTS
          </h2>
        </div>

        <ProjectGallery projects={FEATURED_PROJECTS} />

        {PROJECTS.length > FEATURED_PROJECTS.length && (
          <div className="mt-8 flex justify-center">
            <a
              href="/projects"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[#27272c] bg-[#0c0c0e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
            >
              View More Projects
              <ArrowUpRight className="h-4 w-4 text-[#f0422b]" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
