import React from 'react'
import { ChevronDown, Facebook, Instagram, Youtube } from 'lucide-react'

const Contact = ({
  activeTheme,
  faqs,
  activeFaq,
  setActiveFaq,
  showToast,
}) => {
  return (
    <div className="space-y-20 pb-20 bg-[#F5F5F5]">
      {/* Contact Hero Banner */}
      <section className="relative h-[65vh] min-h-[24rem] max-h-[42rem] bg-slate-950 flex items-center justify-center text-center md:h-[80vh]">
        <img
          src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=80"
          alt="Contact Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-3xl px-6 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white">
            Contact Us
          </h1>
          {/* <p className="text-slate-300 text-base">
                  We'd love to hear from you. Get in touch with our adventure
                  concierge team.
                </p> */}
        </div>
      </section>

      {/* Form & Info Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 bg-gray-50 p-5 sm:p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              We're Ready, Let's Talk.
            </h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                showToast('Message sent successfully!');
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Your Name *"
                required
                className={`w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 ${activeTheme.focus} text-sm transition`}
              />
              <input
                type="email"
                placeholder="Email Address *"
                required
                className={`w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 ${activeTheme.focus} text-sm transition`}
              />
              <textarea
                rows="5"
                placeholder="Message"
                required
                className={`w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 ${activeTheme.focus} text-sm transition resize-none`}
              ></textarea>
              <button
                type="submit"
                className={`px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition ${activeTheme.btn}`}
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-8 bg-gray-50 p-5 sm:p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Contact Info</h2>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Address</h4>
                <p className="text-slate-600 text-xs leading-relaxed mt-1">
                  123 Fifth Avenue, NY 10160, New York, USA
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">Email Us</h4>
                <p className="text-slate-600 text-xs mt-1">
                  contact@example.com
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">Call Us</h4>
                <p className="text-slate-600 text-xs mt-1">800-123-456</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  Follow Us
                </h4>
                <div className="flex space-x-3">
                  {[Facebook, Instagram, Youtube].map((Icon, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className={`p-3 rounded-full text-white  ${activeTheme.divider} ${activeTheme.icon} hover:-translate-y-2 hover:transition-all hover:duration-500 ease-in-out duration-500  transition shadow mt-4`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center space-y-3 mb-10">
          <h3 className="text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h3>
        </div>
        <div className="space-y-4 transition-all duration-500 ease-in-out">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className=" rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all duration-500 ease-in-out"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                aria-expanded={activeFaq === idx}
                aria-controls={`faq-answer-${idx}`}
                className="w-full px-6 py-4 text-left font-bold text-slate-900 flex justify-between items-center text-sm"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 p-0.5 font-semibold transition-transform duration-300 ease-in-out ${activeTheme.divider} rounded-full text-white ${activeFaq === idx ? 'rotate-180 bg-black' : ''}`}
                />
              </button>
              <div
                id={`faq-answer-${idx}`}
                aria-hidden={activeFaq !== idx}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none   ${activeFaq === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 text-slate-600 text-xs leading-relaxed border-t border-slate-50 pt-3">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Contact
