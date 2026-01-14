interface PortfolioGridProps {
  messages: {
    viewProject: string
    technologies: string
  }
}

interface Project {
  id: number
  title: string
  description: string
  technologies: string[]
  category: string
}

// Sample portfolio data - in a real app, this would come from a database
const projects: Project[] = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'Modern e-commerce solution with seamless checkout experience and inventory management.',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL'],
    category: 'E-Commerce',
  },
  {
    id: 2,
    title: 'Corporate Website',
    description: 'Professional corporate website with CMS integration and multilingual support.',
    technologies: ['Next.js', 'Contentful', 'Tailwind CSS'],
    category: 'Corporate',
  },
  {
    id: 3,
    title: 'SaaS Dashboard',
    description: 'Analytics dashboard with real-time data visualization and user management.',
    technologies: ['React', 'TypeScript', 'Chart.js', 'Node.js'],
    category: 'SaaS',
  },
  {
    id: 4,
    title: 'Portfolio Website',
    description: 'Creative portfolio website for a design agency with smooth animations.',
    technologies: ['Next.js', 'Framer Motion', 'Tailwind CSS'],
    category: 'Portfolio',
  },
  {
    id: 5,
    title: 'Restaurant Website',
    description: 'Beautiful restaurant website with online ordering and reservation system.',
    technologies: ['Next.js', 'Stripe', 'MongoDB'],
    category: 'Food & Beverage',
  },
  {
    id: 6,
    title: 'Healthcare Platform',
    description: 'Secure healthcare platform with patient portal and appointment scheduling.',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Auth0'],
    category: 'Healthcare',
  },
]

export function PortfolioGrid({ messages }: PortfolioGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-neutral-200"
        >
          <div className="aspect-video bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-colors duration-300"></div>
          </div>
          <div className="p-6">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2 block">
              {project.category}
            </span>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              {project.title}
            </h3>
            <p className="text-neutral-600 mb-4 leading-relaxed">
              {project.description}
            </p>
            <div className="mb-4">
              <p className="text-sm font-semibold text-neutral-700 mb-2">
                {messages.technologies}:
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <button className="text-primary-600 font-semibold hover:text-primary-700 transition-colors flex items-center gap-2">
              {messages.viewProject}
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}