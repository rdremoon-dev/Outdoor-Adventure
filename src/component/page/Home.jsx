import React from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Pause, Play } from 'lucide-react'
import bannerImage from '../../assets/banner.jpg'

const Home = ({
  activeTheme,
  currentSlide,
  setCurrentSlide,
  isAutoplay,
  setIsAutoplay,
  heroSlides,
  onBook,
  setCurrentPage,
}) => {
  return (
    <div className="space-y-24 bg-[#F5F5F5]">
      {/* Hero Carousel Section */}
      <section className="relative h-[70vh] min-h-[28rem] max-h-[46rem] overflow-hidden bg-slate-950 md:h-[82vh] md:min-h-[34rem]">
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-[8000ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="max-w-4xl space-y-6">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold  tracking-wide">
                    <MapPin className={`w-3.5 h-3.5 ${activeTheme.text}`} />
                    <span>{slide.location}</span>
                  </div>
                  <span
                    className={`block ${activeTheme.text} font-extrabold text-sm tracking-widest uppercase`}
                  >
                    {slide.tagline}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-slate-200 text-base md:text-lg leading-relaxed font-normal">
                    {slide.subtitle}
                  </p>
                  <div className="flex items-start gap-3 pt-4 max-sm:pb-10 max-sm:flex  max-lg:flex sm:items-center sm:gap-2">
                    <button
                      onClick={() => {
                        onBook();
                      }}
                      className={`px-6 py-3 max-sm:px-5 max-sm:py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 flex items-center space-x-3 ${activeTheme.btn}`}
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage('services')}
                      className="px-6 py-3 max-sm:px-5 max-sm:py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 transition"
                    >
                      Explore Trips
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <div className="absolute bottom-8 max-sm:bottom-2  left-6 right-6 z-20 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex space-x-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentSlide ? 'w-12 bg-white' : 'w-4 bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3 text-white">
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 backdrop-blur-md border border-white/10 transition"
            >
              {isAutoplay ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() =>
                setCurrentSlide(
                  prev => (prev - 1 + heroSlides.length) % heroSlides.length,
                )
              }
              className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 backdrop-blur-md border border-white/10 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setCurrentSlide(prev => (prev + 1) % heroSlides.length)
              }
              className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 backdrop-blur-md border border-white/10 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Inspirational Quote Banner */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="relative p-6 sm:p-10 md:p-14 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="absolute top-6 left-8 text-6xl text-slate-200 font-serif select-none">
            “
          </div>
          <blockquote className="text-xl md:text-2xl font-serif text-slate-800 italic leading-relaxed relative z-10">
            "Fuerat aestu carentem habentia spectent tonitrua mutastis locavit
            liberioris."
          </blockquote>
          <cite className="block mt-4 text-xs font-bold uppercase tracking-widest text-slate-400 not-italic">
            - Adam Sandler, Expedition Leader
          </cite>
        </div>
      </section>

      {/* Upcoming Events Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16 flex flex-col justify-center items-center">
          <span
            className={`text-xs font-extrabold tracking-widest uppercase ${activeTheme.text}`}
          >
            Curated Journeys
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Upcoming Events & Expeditions
          </h2>
          <div className={`w-12 h-[2.5px] block ${activeTheme.divider}`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: 'Everest Camp Trek',
              image:
                'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
              desc: 'Fuerat aestu carentem habentia spectent tonitrua mutastis locavit liberioris inistra possedit.',
            },
            {
              title: 'Walking Holidays',
              image:
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
              desc: 'Fuerat aestu carentem habentia spectent tonitrua mutastis locavit liberioris inistra possedit.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                  {item.desc}
                </p>
                <button
                  onClick={() => {
                    onBook();
                  }}
                  className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition ${activeTheme.btn}`}
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore The World Banner */}
      <section
        className="relative py-16 sm:py-28 bg-slate-950 bg-blend-overlay inset-0 bg-opacity-60 overflow-hidden bg-center bg-cover md:bg-top bg-no-repeat md:bg-fixed h-auto min-h-[28rem] md:h-[80vh] justify-center items-center flex flex-col"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        {/* <img
                src="src/assets/banner.jpg"
                alt="Explore World"
                className="absolute inset-0 w-full h-full object-cover "
              /> */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            Explore The World
          </h2>
          <span
            className={`block w-12 h-1 mx-auto ${activeTheme.divider}`}
          ></span>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Diremit mundi mare undae nunc mixtam tanto sibi. Nubes unda
            concordi. Fert his. Recessit mentes praecipites locum caligine sui
            egens erat. Silvas caeli regina.
          </p>
          <button
            onClick={() => {
              onBook();
            }}
            className={`px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl transition transform hover:scale-105 ${activeTheme.btn}`}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Upcoming Tours & Destinations Mosaic */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-6">
            <div className={`w-12 h-[3px] block ${activeTheme.divider}`} />
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              Upcoming Tours & Destination
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fuerat aestu carentem habentia spectent tonitrua mutastis locavit
              liberioris. Sinistra possedit litora ut nabataeaque. Setucant
              coepyterunt perveniunt animal! Concordi aurea nabataeaque
              seductaque constaque cepit sublime flexi nullus.
            </p>
            <button
              onClick={() => setCurrentPage('services')}
              className={`px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${activeTheme.btn}`}
            >
              Learn More
            </button>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=600&q=80"
                alt="Skiing"
                className="rounded-3xl h-56 w-full object-cover shadow-lg hover:shadow-xl transition"
              />
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                alt="Landscape"
                className="rounded-3xl h-72 w-full object-cover shadow-lg hover:shadow-xl transition"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80"
                alt="Hiker"
                className="rounded-3xl h-72 w-full object-cover shadow-lg hover:shadow-xl transition"
              />
              <img
                src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80"
                alt="Camp"
                className="rounded-3xl h-56 w-full object-cover shadow-lg hover:shadow-xl transition"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home
