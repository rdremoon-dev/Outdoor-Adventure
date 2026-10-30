import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Menu,
  X,
  ShieldCheck,
  Award,
  Trees,
  Mountain,
  Waves,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Sliders,
  Maximize2,
  Play,
  Pause,
  ChevronDown
} from 'lucide-react';
import Floating_Toggle from './component/Floating_Toggle';
import Header from './component/Header';
import Home from './component/page/Home';
import About from './component/page/About';
import Project from './component/page/Project';
import Contact from './component/page/Contact';
import Services from './component/page/Services';
import Footer from './component/Footer';
import Admin from './component/page/Admin';
import UserDashboard from './component/page/UserDashboard';
import { apiRequest } from './lib/api';

const PALETTES = {
  rose: {
    name: 'Crimson Rose',
    primary: '#f43f5e',
    primaryHover: '#e11d48',
    bgLight: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-500',
    divider: 'bg-[#f43f5e]',
    focus: 'focus:ring-rose-500',
    icon: 'hover:bg-rose-700',
    faq:'bg-black',
    btn: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  emerald: {
    name: 'Alpine Emerald',
    primary: '#10b981',
    primaryHover: '#059669',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-500',
    divider: 'bg-[#10b981]',
    focus: 'focus:ring-emerald-500',
    icon: 'hover:bg-emerald-700',
    btn: 'bg-emerald-700 hover:bg-emerald-700 text-white',
  },
  sapphire: {
    name: 'Glacier Sapphire',
    primary: '#0284c7',
    primaryHover: '#0369a1',
    bgLight: 'bg-sky-50',
    text: 'text-sky-600',
    border: 'border-sky-500',
    divider: 'bg-[#0284c7]',
    focus: 'focus:ring-sky-500',
    icon: 'hover:bg-sky-700',
    btn: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
  amber: {
    name: 'Sunset Amber',
    primary: '#d97706',
    primaryHover: '#b45309',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-500',
    divider: 'bg-[#d97706]',
    focus: 'focus:ring-amber-500',
    icon: 'hover:bg-amber-700',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
};

const HERO_SLIDES = [
  {
    id: 1,
    tagline: 'Explore the Colourful World',
    title: 'A Wonderful Gift of Nature',
    subtitle: 'Embark on hand-crafted wilderness journeys designed for seekers of extraordinary outdoor experiences.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85',
    location: 'Brais Lake, Italian Dolomites'
  },
  {
    id: 2,
    tagline: 'Summit New Heights',
    title: 'Majestic Peaks & Alpine Trails',
    subtitle: 'Challenge your spirit across rugged mountain terrain guided by seasoned mountaineering professionals.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    location: 'Matterhorn Alpine Ridge, Switzerland'
  },
  {
    id: 3,
    tagline: 'Deep Wilderness Journeys',
    title: 'Unspoiled River Canyons',
    subtitle: 'Navigate emerald waters and serene glacial valleys untouched by modern noise.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=85',
    location: 'Moraine Lake, Banff National Park'
  }
];

const SERVICES_DATA = [
  {
    id: 'backpacking',
    title: 'Backpacking Trips',
    category: 'Hiking & Trekking',
    duration: '5 - 12 Days',
    groupSize: 'Max 8 People',
    price: '$1,250',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in deep wilderness trails with full support expedition setups, premium gear, and gourmet trail meals.',
    features: ['Professional Certified Lead Guide', 'Top-tier Tent & Camping Gear Provided', 'Organic Gourmet Wilderness Catering', 'Satellite Emergency Communication']
  },
  {
    id: 'hiking',
    title: 'Family Hiking Trips',
    category: 'Leisure & Eco-Tours',
    duration: '3 - 5 Days',
    groupSize: 'Max 12 People',
    price: '$850',
    rating: 4.95,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    description: 'Customized low-impact scenic trails designed for all age groups with luxurious eco-lodge stops along the way.',
    features: ['Family-tailored Moderate Routes', 'Comfortable Boutique Mountain Lodges', 'Interactive Wildlife Identification', 'Luggage Transfer Between Stops']
  },
  {
    id: 'water-sports',
    title: 'Water Sports & Kayaking',
    category: 'Aquatic Adventures',
    duration: '2 - 7 Days',
    groupSize: 'Max 6 People',
    price: '$980',
    rating: 4.88,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    description: 'Glide through crystal-clear alpine lakes and white-water gorges equipped with state-of-the-art expedition kayaks.',
    features: ['Sea & Whitewater Kayaks Included', 'Safety Watercraft Support Escort', 'Dry Suit & Technical Safety Gear', 'Coastal & Island Wilderness Camps']
  },
  {
    id: 'winter-sports',
    title: 'Winter Alpine Sports',
    category: 'Snow Expeditions',
    duration: '4 - 8 Days',
    groupSize: 'Max 6 People',
    price: '$1,650',
    rating: 4.97,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=800&q=80',
    description: 'Carve pristine powder lines and explore frozen glacier caves under the guidance of UIAGM certified mountain masters.',
    features: ['Avalanche Safety & Search Training', 'Heli-Drop & Backcountry Access', 'Heated Luxury Base Camp Tents', 'Daily Thermal Hot Springs Access']
  }
];

const PROJECTS_GALLERY = [
  { id: 1, title: 'Emerald Lake Kayaking', category: 'Water Sports', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', location: 'Lake Louise, Canada' },
  { id: 2, title: 'Dolomites Alpine Ridge', category: 'Mountain Climbing', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', location: 'Cortina, Italy' },
  { id: 3, title: 'Winter Powder Descent', category: 'Winter Sports', image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=800&q=80', location: 'Whistler, Canada' },
  { id: 4, title: 'Pine Forest Basecamp', category: 'Forest & Camping', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80', location: 'Yosemite National Park' },
  { id: 5, title: 'Glacial River Rafting', category: 'Water Sports', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', location: 'Reykjavik, Iceland' },
  { id: 6, title: 'Summit Sunrise Trek', category: 'Mountain Climbing', image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80', location: 'Mount Blanc, France' },
  { id: 7, title: 'Snow Peak Heli-Skiing', category: 'Winter Sports', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80', location: 'Alps, Switzerland' },
  { id: 8, title: 'Redwood Forest Starlight', category: 'Forest & Camping', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', location: 'California, USA' }
];

const GUIDES = [
  { name: 'Adam Sandler', role: 'Lead Alpine Guide', exp: '14+ Years', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', specialty: 'High Altitude Mountaineering' },
  { name: 'Elena Rostova', role: 'Kayaking & Water Master', exp: '10+ Years', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', specialty: 'Glacial River Navigation' },
  { name: 'Marcus Vance', role: 'Wilderness Survival Lead', exp: '12+ Years', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', specialty: 'Forest Expeditions & Tracking' }
];

const FAQS = [
  { q: 'What safety precautions are taken during high-risk expeditions?', a: 'All trips carry satellite emergency locator beacons (PLBs), comprehensive trauma kits, dual certified UIAGM guides, and real-time mountain weather tracking.' },
  { q: 'Do I need to bring my own camping and technical gear?', a: 'We provide four-season technical tents, sub-zero sleeping bags, mountaineering harnesses, and all group cooking gear. You only bring personal footwear and apparel.' },
  { q: 'How physically demanding are the level 4 expeditions?', a: 'Level 4 requires good cardiovascular endurance (ability to hike 6-8 hours daily with a 15kg pack). We provide custom 8-week pre-departure training guides.' },
  { q: 'What is your cancellation and weather reschedule policy?', a: 'Trips rescheduled due to adverse weather receive 100% credit transfer. Cancellations made 30 days prior receive full refund minus processing fees.' }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname === '/admin') return 'admin';
    if (window.location.pathname === '/account') return 'account';
    return 'home';
  });
  const [theme, setTheme] = useState('rose');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [paymentQuote, setPaymentQuote] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [activeFaq, setActiveFaq] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    guests: 2,
    date: '',
    destination: SERVICES_DATA[0].title,
    billingCountry: 'INTL',
    customerCountry: 'United States'
  });

  const activeTheme = PALETTES[theme];

  // Auto slide advance
  useEffect(() => {
    let interval;
    if (isAutoplay && currentPage === 'home') {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, currentPage]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ adventure: bookingForm.destination, guests: String(bookingForm.guests || 1), billingCountry: bookingForm.billingCountry });
    apiRequest(`/api/payments/quote?${params.toString()}`).then(quote => { if (active) setPaymentQuote(quote); }).catch(() => { if (active) setPaymentQuote(null); });
    return () => { active = false; };
  }, [bookingForm.destination, bookingForm.guests, bookingForm.billingCountry]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (!payment) return;
    const messages = { success: 'Payment verified. Your booking request is paid; the team still needs to confirm trip availability.', failed: 'Payment failed. Your booking request is saved; please try checkout again or contact support.', cancelled: 'Payment was cancelled. Your booking request is saved but unpaid.', verification_pending: 'Payment was received by the gateway and is being verified. Check your booking status shortly.' };
    showToast(messages[payment] || 'Payment status updated.');
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingError('');
    try {
      const result = await apiRequest('/api/bookings', {
        method: 'POST',
        headers: sessionStorage.getItem('outdoor_user_token')
          ? { Authorization: `Bearer ${sessionStorage.getItem('outdoor_user_token')}` }
          : {},
        body: JSON.stringify(bookingForm),
      });
      if (result.paymentEnabled) {
        const userToken = sessionStorage.getItem('outdoor_user_token');
        const checkout = await apiRequest(`/api/payments/checkout/${result.bookingId}`, {
          method: 'POST',
          headers: userToken ? { Authorization: `Bearer ${userToken}` } : {},
          body: JSON.stringify({}),
        });
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      setBookingModalOpen(false);
      setBookingForm({ name: '', email: '', phone: '', message: '', guests: 2, date: '', destination: bookingForm.destination, billingCountry: bookingForm.billingCountry, customerCountry: bookingForm.customerCountry });
      showToast(`${result.message} Reference: ${String(result.bookingId).slice(-8).toUpperCase()} Payment checkout is not configured yet.`);
    } catch (error) {
      setBookingError(error.message || 'Unable to submit your booking. If you received a booking reference, the request may already be saved; please contact support before submitting again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const openBooking = (service = SERVICES_DATA[0]) => {
    setBookingError('');
    setBookingForm(form => ({ ...form, destination: service.title }));
    setBookingModalOpen(true);
  };

  const filteredGallery = galleryFilter === 'All'
    ? PROJECTS_GALLERY
    : PROJECTS_GALLERY.filter(item => item.category === galleryFilter);

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-800 font-sans selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed left-4 right-4 top-20 z-50 flex items-center space-x-3 rounded-2xl border border-slate-700/50 bg-slate-900 px-5 py-3.5 text-white shadow-2xl animate-bounce sm:left-auto sm:right-6 sm:max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Floating Customize Toggle Bar */}
      <Floating_Toggle
        activeTheme={activeTheme}
        customizeOpen={customizeOpen}
        setCustomizeOpen={setCustomizeOpen}
        onBook={() => openBooking()}
      />
    

      {/* Customizer Drawer */}
      {customizeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="flex h-full w-full flex-col justify-between border-l border-slate-100 bg-white p-5 shadow-2xl animate-in slide-in-from-right duration-300 sm:w-80 sm:p-6">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-rose-500" />
                  <span>Theme Studio</span>
                </h3>
                <button
                  onClick={() => setCustomizeOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Accent Color Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(PALETTES).map(([key, pal]) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition ${
                        theme === key
                          ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pal.primary }}
                      ></span>
                      <span className="text-xs font-semibold text-slate-700">
                        {pal.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center">
              <button
                onClick={() => setCustomizeOpen(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow transition"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Navigation */}
      <Header
        activeTheme={activeTheme}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onBook={() => openBooking()}
        onAccount={() => setCurrentPage('account')}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-grow">
        {currentPage === 'admin' && <Admin showToast={showToast} />}
        {currentPage === 'account' && <UserDashboard showToast={showToast} />}
        {/* ================= HOME PAGE ================= */}
        {currentPage === 'home' && (
          <Home
            activeTheme={activeTheme}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            isAutoplay={isAutoplay}
            setIsAutoplay={setIsAutoplay}
            heroSlides={HERO_SLIDES}
            onBook={openBooking}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* ================= ABOUT PAGE ================= */}
        {currentPage === 'about' && (
          <About activeTheme={activeTheme} guides={GUIDES} />
        )}

        {/* ================= SERVICES PAGE ================= */}
        {currentPage === 'services' && (
          <Services
            activeTheme={activeTheme}
            services={SERVICES_DATA}
            onBook={openBooking}
          />
        )}

        {/* ================= PROJECTS PAGE ================= */}
        {currentPage === 'projects' && (
          <Project
            activeTheme={activeTheme}
            galleryFilter={galleryFilter}
            setGalleryFilter={setGalleryFilter}
            filteredGallery={filteredGallery}
            setLightboxImage={setLightboxImage}
          />
        )}

        {/* ================= CONTACT PAGE ================= */}
        {currentPage === 'contact' && (
          <Contact
            activeTheme={activeTheme}
            faqs={FAQS}
            activeFaq={activeFaq}
            setActiveFaq={setActiveFaq}
            showToast={showToast}
          />
        )}
      </main>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Expanded Preview"
            className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-200 sm:max-h-[calc(100dvh-3rem)] sm:p-8">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="mb-2 pr-10 text-xl font-extrabold text-slate-900 sm:text-2xl">
              Book Expedition
            </h3>
            <p className="text-slate-500 text-xs mb-6">
              Reserve your spot on our next wilderness journey.
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Trip Destination
                </label>
                <select
                  value={bookingForm.destination}
                  onChange={e =>
                    setBookingForm({
                      ...bookingForm,
                      destination: e.target.value,
                    })
                  }
                  className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none`}
                >
                  {SERVICES_DATA.map(s => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={bookingForm.name}
                  onChange={e =>
                    setBookingForm({ ...bookingForm, name: e.target.value })
                  }
                  className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={bookingForm.email}
                  onChange={e =>
                    setBookingForm({ ...bookingForm, email: e.target.value })
                  }
                  className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <input type="tel" required maxLength={30} placeholder="+1 555 000 0000" value={bookingForm.phone} onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })} className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none`} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                    value={bookingForm.date}
                    onChange={e =>
                      setBookingForm({ ...bookingForm, date: e.target.value })
                    }
                    className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none `}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bookingForm.guests}
                    onChange={e =>
                      setBookingForm({ ...bookingForm, guests: e.target.value })
                    }
                    className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Billing region / currency</label>
                  <select value={bookingForm.billingCountry} onChange={e => setBookingForm({ ...bookingForm, billingCountry: e.target.value, customerCountry: e.target.value === 'BD' ? 'Bangladesh' : 'United States' })} className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none`}>
                    <option value="BD">Bangladesh — BDT</option>
                    <option value="INTL">International — USD</option>
                  </select>
                </div>
                {bookingForm.billingCountry === 'INTL' && <div>
                  <label className="text-xs font-semibold text-slate-700">Your country</label>
                  <input type="text" required maxLength={80} placeholder="e.g. United States" value={bookingForm.customerCountry} onChange={e => setBookingForm({ ...bookingForm, customerCountry: e.target.value })} className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none`} />
                </div>}
              </div>
              {paymentQuote && <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-600"><span>Price per guest</span><strong>{new Intl.NumberFormat(undefined, { style: 'currency', currency: paymentQuote.currency, maximumFractionDigits: 2 }).format(paymentQuote.amount / Math.max(1, Number(bookingForm.guests) || 1))}</strong></div>
                <div className="mt-2 flex items-center justify-between gap-3"><span className="text-sm font-bold text-slate-800">Estimated total · {bookingForm.guests} guest(s)</span><strong className="text-lg font-extrabold text-emerald-800">{new Intl.NumberFormat(undefined, { style: 'currency', currency: paymentQuote.currency, maximumFractionDigits: 2 }).format(paymentQuote.amount)}</strong></div>
                {paymentQuote.currency === 'BDT' && <p className="mt-2 text-[10px] leading-4 text-slate-500">BDT amount uses the website's configured pricing rate (USD 1 = BDT {paymentQuote.usdToBdtRate}); gateway fees or bank conversion may apply.</p>}
                {!paymentQuote.payable && <p className="mt-2 text-[10px] leading-4 text-rose-700">This total is outside the configured payment limits. Contact the team to arrange an approved payment method.</p>}
                {!paymentQuote.paymentEnabled && <p className="mt-2 text-[10px] leading-4 text-amber-700">{bookingForm.billingCountry === 'BD' ? 'Online payment is not configured yet. You can still submit your booking request and the team will contact you.' : 'Online payment is currently available only for Bangladesh billing. You can still submit your booking request and the team will contact you.'}</p>}
              </div>}

              <div>
                <label className="text-xs font-semibold text-slate-700">Additional Notes (optional)</label>
                <textarea rows={3} maxLength={1000} placeholder="Tell us about your group or any special requirements" value={bookingForm.message} onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })} className={`w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 ${activeTheme.focus} focus:outline-none resize-none`} />
              </div>
              {bookingError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-700">{bookingError}</p>}
              <p className="text-[11px] leading-5 text-slate-500">Prices are per guest. Online checkout through SSLCOMMERZ (BDT) is available for Bangladesh billing only. International customers can submit a booking request and the team will contact them about payment. Payment does not confirm trip availability; our team must still approve your booking.</p>
              <button
                type="submit"
                disabled={bookingSubmitting || (Boolean(paymentQuote?.paymentEnabled) && paymentQuote?.payable === false)}
                className={`w-full mt-4 py-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${activeTheme.btn}`}
              >
                {bookingSubmitting ? 'Preparing Secure Checkout…' : (paymentQuote?.paymentEnabled ? 'Continue to Secure Payment' : 'Submit Booking Request')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <Footer/>
    </div>
  );
}
