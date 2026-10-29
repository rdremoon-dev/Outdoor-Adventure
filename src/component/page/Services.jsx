import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import serviceImage from '../../assets/service.avif'

const Services = ({ activeTheme, services, onBook }) => {
  return (
    <div className="space-y-20 pb-20 bg-[#F5F5F5]">
      {/* Services Hero Header */}
      <section className="relative h-[65vh] min-h-[24rem] max-h-[42rem] bg-slate-950 flex items-center justify-center text-center md:h-[80vh]">
        <img
          src={serviceImage}
          alt="Services Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-3xl px-6 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white">
            Services
          </h1>
          {/* <p className="text-slate-300 text-base">
                  Comprehensive, fully supported wilderness expeditions tailored
                  for adventurers of all skill levels.
                </p> */}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12 mt-12 sm:mb-16 sm:mt-16 flex flex-col justify-center items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            It's Time to Start Your Adventures
          </h2>
          <div className={`w-12 h-[2.5px] block ${activeTheme.divider}`} />
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Click edit button to change this text. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Ut elit tellus, luctus ullamcorper
            pulvinar.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map(srv => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900">
                    {srv.price} / person
                  </div>
                </div>
                <div className="p-5 sm:p-8 space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {srv.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {srv.description}
                  </p>
                  <div className="space-y-2 pt-2">
                    {srv.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 text-xs text-slate-700"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${activeTheme.text} flex-shrink-0`}
                        />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0 sm:p-8 sm:pt-0">
                <button
                  onClick={() => onBook(srv)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${activeTheme.btn}`}
                >
                  Book This Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us & What You Get */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-5 sm:p-8 space-y-4">
            <div className={`w-12 h-[2.5px] block ${activeTheme.divider}`} />
            <h3 className="text-2xl font-bold text-slate-900">
              Why Outdoor Adventure
            </h3>
            <p className="text-slate-600 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                'Experience: Locavit liberioris possedit',
                'Reputation: Diremit mundi mare undae',
                'Guide Experience: Spectent tonitrua mutastis',
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center space-x-3 text-xs font-semibold text-slate-700"
                >
                  <span
                    className={`w-3 h-[2.5px] ${activeTheme.divider} rounded-full`}
                  ></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 sm:p-8 space-y-4">
            <div className={`w-12 h-[2.5px] block ${activeTheme.divider}`} />
            <h3 className="text-2xl font-bold text-slate-900">What You Get</h3>
            <p className="text-slate-600 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                'Private Hike: Locavit liberioris possedit',
                'Transportation: Diremit mundi mare undae',
                'Great Facilities: Spectent tonitrua mutastis',
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center space-x-3 text-xs font-semibold text-slate-700"
                >
                  <span
                    className={`w-3 h-[2.5px] ${activeTheme.divider} rounded-full`}
                  ></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Services
