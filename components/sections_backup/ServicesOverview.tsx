interface ServicesOverviewProps {
  messages: {
    title: string
    subtitle: string
    webDesign: { title: string; description: string }
    uiux: { title: string; description: string }
    development: { title: string; description: string }
    optimization: { title: string; description: string }
  }
}

export function ServicesOverview({ messages }: ServicesOverviewProps) {
  const services = [
    { ...messages.webDesign, icon: '🎨' },
    { ...messages.uiux, icon: '✨' },
    { ...messages.development, icon: '⚡' },
    { ...messages.optimization, icon: '🚀' },
  ]

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {messages.title}
          </h2>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            {messages.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-all duration-300 hover:shadow-lg border border-neutral-200"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {service.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}