import { useEffect, useState } from 'react';
import { ArrowUpRight, Github, X } from 'lucide-react';
import type { ProjectItem } from '../data/projects';

function ProjectCard({
  project,
  onViewDetails,
}: {
  project: ProjectItem;
  onViewDetails: (project: ProjectItem) => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#27272c] bg-[#0c0c0e]">
      <div className="aspect-[4/3] overflow-hidden bg-[#111114]">
        <img
          src={project.image}
          alt={`${project.title} project`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#f0422b]">
          {project.category}
        </p>
        <h3 className="mt-3 text-lg font-semibold leading-snug text-zinc-100">
          {project.title}
        </h3>
        <p className="mt-2 min-h-12 text-sm leading-relaxed text-zinc-400">
          {project.summary}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={() => onViewDetails(project)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
          >
            View Details
            <ArrowUpRight className="h-4 w-4 text-[#f0422b]" aria-hidden="true" />
          </button>
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProjectGallery({ projects }: { projects: ProjectItem[] }) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  useEffect(() => {
    if (!selectedProject) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  return (
    <>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={setSelectedProject}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] px-6 py-10 text-center">
          <p className="text-sm text-zinc-400">Project details will appear here.</p>
        </div>
      )}

      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
          onClick={() => setSelectedProject(null)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md sm:p-6"
        >
          <article
            onClick={(event) => event.stopPropagation()}
            className="my-auto w-full max-w-3xl overflow-hidden rounded-xl border border-[#27272c] bg-[#0c0c0e] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#f0422b]">
                  {selectedProject.category}
                </p>
                <h3
                  id="project-detail-title"
                  className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl"
                >
                  {selectedProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#27272c] text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-2 focus-visible:outline-[#f0422b]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <img
              src={selectedProject.image}
              alt={`${selectedProject.title} project overview`}
              className="max-h-[50vh] w-full bg-[#111114] object-contain"
            />

            <div className="p-6 sm:p-8">
              <p className="whitespace-pre-line text-base leading-relaxed text-zinc-300">
                {selectedProject.fullDescription}
              </p>
              {selectedProject.highlights && selectedProject.highlights.length > 0 && (
                <ul className="mt-6 space-y-3 border-t border-[#1f1f23] pt-6">
                  {selectedProject.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-3 text-sm leading-relaxed text-zinc-400"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f0422b]" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
              {selectedProject.repositoryUrl && (
                <a
                  href={selectedProject.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex items-center gap-2 rounded-md border border-[#27272c] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0422b]"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  View GitHub Repository
                  <ArrowUpRight className="h-4 w-4 text-[#f0422b]" aria-hidden="true" />
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </>
  );
}
