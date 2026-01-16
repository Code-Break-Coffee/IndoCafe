import React from 'react';
import { serviceTypes } from '../../data/mockData';

const ServiceTypeSelector = ({ onDineIn }) => {
  const handleServiceClick = (serviceId) => {
    if (serviceId === 'dine-in' && onDineIn) {
      onDineIn();
    }
    // For delivery, just continue browsing the menu (default behavior)
  };

  return (
    <section className="py-16 bg-surface -mt-20 relative z-20 container mx-auto px-4 rounded-t-3xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {serviceTypes.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceClick(service.id)}
            className="bg-surface rounded-2xl shadow-xl p-8 border border-secondary/10 hover:border-primary transition-colors duration-300 group cursor-pointer"
          >
            <div className="flex items-start space-x-6">
              <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary transition-colors duration-300">
                {service.icon === 'delivery' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary group-hover:text-on-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary group-hover:text-on-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-secondary mb-4">{service.description}</p>
                <span className="text-primary font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  {service.action}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceTypeSelector;
