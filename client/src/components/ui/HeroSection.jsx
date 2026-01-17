import { useTheme } from '../../context/useTheme';
import { Moon, Sun, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const { isDarkMode, toggleTheme, brandConfig } = useTheme();

  return (
    <section className="relative bg-background text-text transition-colors duration-300 min-h-[600px] flex items-center">
      <div className="container mx-auto px-6 py-16 md:py-24 flex flex-col-reverse md:flex-row items-center">
        {/* Text Content */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
            {brandConfig.identity.name}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">{brandConfig.identity.tagline}</h1>

          <p className="text-lg md:text-xl text-secondary mb-8 max-w-lg">{brandConfig.identity.description}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-primary text-on-primary font-bold rounded hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center group">
              Order Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={toggleTheme}
              className="px-8 py-4 bg-surface text-text border border-secondary/20 font-bold rounded hover:bg-secondary/5 transition-all flex items-center justify-center"
            >
              {isDarkMode ? (
                <>
                  <Sun className="mr-2 h-5 w-5" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-5 w-5" /> Dark Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Image/Visual */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-lg aspect-square bg-surface rounded-2xl shadow-2xl overflow-hidden border border-secondary/10 flex items-center justify-center">
            <span className="text-secondary/50 text-lg font-medium">Hero Image Placeholder</span>
            {/* Decorative Blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
