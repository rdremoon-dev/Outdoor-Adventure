import React from 'react'
import aboutImage from '../../assets/about.avif'

const About = ({ activeTheme, guides }) => {
  return (
    <div className="space-y-20 pb-20 bg-[#F5F5F5] transition-all duration-500 ease-in-out ">
      {/* Header Title Section */}
      <section className="relative h-[65vh] min-h-[24rem] max-h-[42rem] bg-slate-950 flex items-center justify-center text-center md:h-[80vh]">
        <img
          src={aboutImage}
          alt="About Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-3xl px-6 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white">
            Who We Are?
          </h1>
          {/* <p className="text-slate-300 text-base">
                  Delivering authentic wilderness adventures with zero
                  compromise on safety or environmental preservation.
                </p> */}
        </div>
      </section>

      {/* Our Mission Grid */}
      <section className="max-w-7xl mx-auto px-6 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6">
            <div className={`w-12 h-[2.5px] block ${activeTheme.divider}`} />
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Click edit button to change this text. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Ut elit tellus, luctus nec
              ullamcorper mattis, pulvinar dapibus leo.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Click edit button to change this text. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Ut elit tellus, luctus nec
              ullamcorper mattis, pulvinar dapibus leo.
            </p>
          </div>
          <div>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded bg-gray-200 p-2 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80"
                alt="Mission"
                className="h-full w-full rounded object-cover transition duration-700 ease-in-out hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 bg-[#F5F5F5]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="rounded p-5 sm:p-8 lg:p-10 space-y-4">
            <div className={`w-12 h-[2.5px] block ${activeTheme.divider}`} />
            <h3 className="text-2xl font-bold text-slate-900">
              Extraordinary Experiences
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Click edit button to change this text. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Ut elit tellus, luctus nec
              ullamcorper mattis, pulvinar dapibus leo.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Click edit button to change this text. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Ut elit tellus, luctus nec
              ullamcorper mattis, pulvinar dapibus leo.
            </p>
          </div>

          <div className="rounded p-5 sm:p-8 lg:p-10 space-y-4">
            <div className={`w-12 h-[2.5px] block ${activeTheme.divider}`} />
            <h3 className="text-2xl font-bold text-slate-900">
              Our Core Values
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                'Locavit liberioris possedit',
                'Diremit mundi mare undae',
                'Spectent tonitrua mutastis',
              ].map((val, idx) => (
                <li
                  key={idx}
                  className="flex items-center space-x-3 text-sm font-semibold text-slate-700"
                >
                  <div
                    className={`w-4 h-[2.5px] block ${activeTheme.divider}`}
                  />
                  <span>{val}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Expedition Guides */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12">
          <span
            className={`text-xs font-extrabold tracking-widest uppercase ${activeTheme.text}`}
          >
            Meet The Team
          </span>
          <h2 className="text-3xl font-bold text-slate-900">
            Expedition Masters
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md text-center space-y-4"
            >
              <img
                src={guide.image}
                alt={guide.name}
                className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-slate-100"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-lg">
                  {guide.name}
                </h4>
                <p
                  className={`text-xs font-bold ${activeTheme.text} uppercase tracking-wide`}
                >
                  {guide.role}
                </p>
              </div>
              <div className="pt-2 text-xs text-slate-500 space-y-1">
                <p>
                  Experience:{' '}
                  <strong className="text-slate-800">{guide.exp}</strong>
                </p>
                <p>
                  Specialty:{' '}
                  <strong className="text-slate-800">{guide.specialty}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About
