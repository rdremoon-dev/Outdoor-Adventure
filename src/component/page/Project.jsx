import React from 'react'
import { MapPin, Maximize2 } from 'lucide-react'

const Project = ({
  activeTheme,
  galleryFilter,
  setGalleryFilter,
  filteredGallery,
  setLightboxImage,
}) => {
  return (
    <div className="space-y-16 pb-20 bg-[#F5F5F5]">
      {/* Header Title Banner */}
      <section className="relative h-[65vh] min-h-[24rem] max-h-[42rem] bg-slate-950 flex items-center justify-center text-center md:h-[80vh]">
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
          alt="Projects Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-3xl px-6 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white">
            Our Projects
          </h1>
          {/* <p className="text-slate-300 text-base">
                  Explore our past expeditions, water sports, winter trails, and
                  camping journeys across the world.
                </p> */}
        </div>
      </section>

      {/* Gallery Filter & Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            'All',
            'Water Sports',
            'Winter Sports',
            'Forest & Camping',
            'Mountain Climbing',
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setGalleryFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
                galleryFilter === cat
                  ? `${activeTheme.btn} shadow-lg`
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {filteredGallery.map(proj => (
            <div
              key={proj.id}
              onClick={() => setLightboxImage(proj.image)}
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md cursor-pointer hover:shadow-2xl transition-all duration-300"
            >
              <div className="h-72 overflow-hidden relative">
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="p-6 space-y-1">
                <span
                  className={`text-[10px] font-bold tracking-widest ${activeTheme.text} uppercase`}
                >
                  {proj.category}
                </span>
                <h4 className="font-bold text-slate-900 text-lg">
                  {proj.title}
                </h4>
                <p className="text-xs text-slate-600 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{proj.location}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Project
