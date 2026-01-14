interface ServicesDetailProps {
  messages: {
    webDesign: { title: string; description: string; features: string[] }
    uiux: { title: string; description: string; features: string[] }
    development: { title: string; description: string; features: string[] }
    optimization: { title: string; description: string; features: string[] }
  }
}

export function ServicesDetail({ messages }: ServicesDetailProps) {
  const services = [
    { ...messages.webDesign, icon: '🎨', color: 'primary' },
    { ...messages.uiux, icon: '✨', color: 'purple' },
    { ...messages.development, icon: '⚡', color: 'blue' },
    { ...messages.optimization, icon: '🚀', color: 'green' },
  ]

  return (
    <div className="space-y-16 md:space-y-24">
      {services.map((service, index) => (
        <div
          key={index}
          className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-12 items-center`}
        >
          <div className="flex-1">
            <div className="text-5xl mb-6">{service.icon}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              {service.title}
            </h2>
            <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
              {service.description}
            </p>
            <ul className="space-y-3">
              {service.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-neutral-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl shadow-lg"></div>
          </div>
        </div>
      ))}
    </div>
  )
}