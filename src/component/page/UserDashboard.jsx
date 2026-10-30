import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  CircleUserRound,
  CreditCard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

const userTokenKey = 'outdoor_user_token';
const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50';
const dateLabel = value =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not set';
const moneyLabel = booking =>
  booking.paymentAmount != null
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: booking.paymentCurrency || 'USD',
        maximumFractionDigits: 2,
      }).format(booking.paymentAmount)
    : 'Quote at checkout';

export default function UserDashboard({ showToast }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(userTokenKey) || '');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tips, setTips] = useState([]);
  const [section, setSection] = useState('overview');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadAccount = useCallback(async authToken => {
    const headers = { Authorization: `Bearer ${authToken}` };
    const [account, reservations, bookingTips] = await Promise.all([
      apiRequest('/api/auth/me', { headers }),
      apiRequest('/api/bookings/mine', { headers }),
      apiRequest('/api/tips'),
    ]);
    setUser(account.user);
    setProfile({ name: account.user.name, phone: account.user.phone || '' });
    setBookings(reservations.bookings || []);
    setTips(bookingTips.tips || []);
  }, []);

  useEffect(() => {
    if (!token) return;
    let active = true;
    Promise.all([
      apiRequest('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
      apiRequest('/api/bookings/mine', { headers: { Authorization: `Bearer ${token}` } }),
      apiRequest('/api/tips'),
    ])
      .then(([account, reservations, bookingTips]) => {
        if (!active) return;
        setUser(account.user);
        setProfile({ name: account.user.name, phone: account.user.phone || '' });
        setBookings(reservations.bookings || []);
        setTips(bookingTips.tips || []);
      })
      .catch(err => {
        if (!active) return;
        if (/session expired|sign in/i.test(err.message)) {
          sessionStorage.removeItem(userTokenKey);
          setToken('');
          setUser(null);
        }
        setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/user/login';
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      sessionStorage.setItem(userTokenKey, data.token);
      setToken(data.token);
      setUser(data.user);
      setForm({ name: '', email: data.user.email, phone: '', password: '' });
      showToast?.(mode === 'register' ? 'Your account is ready.' : 'Welcome back.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await apiRequest('/api/auth/me', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      setUser(data.user);
      showToast?.(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function startPayment(booking) {
    setBusy(true);
    setError('');
    try {
      const checkout = await apiRequest(`/api/payments/checkout/${booking._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function refresh() {
    setBusy(true);
    setError('');
    try {
      await loadAccount(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem(userTokenKey);
    setToken('');
    setUser(null);
    setBookings([]);
    setSection('overview');
    setError('');
  }

  if (!token || !user) {
    return (
      <section className="min-h-[75vh] bg-slate-950 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Adventure account
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            {mode === 'register' ? 'Create your account' : 'Welcome back.'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage your trips, payments, and profile in one place.
          </p>
          <form onSubmit={submitAuth} className="mt-7 space-y-4">
            {mode === 'register' && (
              <>
                <label className="block text-sm font-semibold text-slate-700">
                  Full name
                  <input
                    className={inputClass}
                    autoComplete="name"
                    maxLength={100}
                    required
                    value={form.name}
                    onChange={event => setForm({ ...form, name: event.target.value })}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Phone
                  <input
                    className={inputClass}
                    autoComplete="tel"
                    maxLength={30}
                    value={form.phone}
                    onChange={event => setForm({ ...form, phone: event.target.value })}
                  />
                </label>
              </>
            )}
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                className={inputClass}
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={event => setForm({ ...form, email: event.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                className={inputClass}
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength={mode === 'register' ? 10 : undefined}
                required
                value={form.password}
                onChange={event => setForm({ ...form, password: event.target.value })}
              />
            </label>
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <button
              disabled={busy}
              className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setError('');
            }}
            className="mt-5 w-full text-center text-sm font-semibold text-emerald-800 hover:underline"
          >
            {mode === 'register' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
          <p className="mt-5 text-center text-xs text-slate-400">
            Passwords are securely hashed. Your account only shows your bookings.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] bg-[#f6f8f7] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
              <CircleUserRound className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {[
              { id: 'overview', label: 'My adventures', icon: CalendarDays },
              { id: 'profile', label: 'My profile', icon: UserRound },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  section === item.id ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <button onClick={signOut} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-rose-500/15 hover:text-rose-200">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Customer dashboard</p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                {section === 'profile' ? 'Your profile' : 'Your adventures'}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {section === 'profile' ? 'Keep your contact details up to date.' : 'Review your reservations and payment status.'}
              </p>
            </div>
            {section === 'overview' && (
              <button onClick={refresh} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> Refresh
              </button>
            )}
          </header>
          {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

          {section === 'profile' ? (
            <form onSubmit={saveProfile} className="mt-5 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <label className="block text-sm font-semibold text-slate-700">
                Full name
                <input className={inputClass} required maxLength={100} value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} />
              </label>
              <label className="mt-5 block text-sm font-semibold text-slate-700">
                Email address
                <input className={`${inputClass} bg-slate-50 text-slate-500`} value={user.email} readOnly />
                <span className="mt-1 block text-xs font-normal text-slate-400">Contact support to change your account email.</span>
              </label>
              <label className="mt-5 block text-sm font-semibold text-slate-700">
                Phone
                <input className={inputClass} maxLength={30} value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} />
              </label>
              <button disabled={busy} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                Save profile
              </button>
            </form>
          ) : (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Booking requests</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{bookings.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Awaiting payment</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {bookings.filter(item => !['paid', 'not_configured'].includes(item.paymentStatus)).length}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {bookings.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
                    <h2 className="mt-3 font-bold text-slate-900">No bookings yet</h2>
                    <p className="mt-1 text-sm text-slate-500">Your signed-in booking requests will appear here.</p>
                  </div>
                ) : bookings.map(booking => (
                  <article key={booking._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="font-bold text-slate-900">{booking.adventure}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {dateLabel(booking.bookingDate)} · {booking.guests} guest{booking.guests === 1 ? '' : 's'}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">Reference {String(booking._id).slice(-8).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{moneyLabel(booking)}</p>
                        <p className="mt-1 text-xs capitalize text-slate-500">Trip: {booking.status} · Payment: {(booking.paymentStatus || 'not configured').replace('_', ' ')}</p>
                      </div>
                    </div>
                    {booking.paymentStatus !== 'paid' && booking.billingCountry === 'BD' && (
                      <button
                        disabled={busy || (booking.paymentStatus === 'pending' && booking.transactionId)}
                        onClick={() => startPayment(booking)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CreditCard className="h-4 w-4" />
                        {booking.paymentStatus === 'pending' ? 'Checkout started' : 'Continue to payment'}
                      </button>
                    )}
                    {booking.paymentStatus !== 'paid' && booking.billingCountry !== 'BD' && (
                      <p className="mt-3 text-xs text-slate-500">The team will contact you to arrange payment for international billing.</p>
                    )}
                  </article>
                ))}
              </div>
              <section className="mt-8">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-700" />
                  <h2 className="text-xl font-extrabold text-slate-900">Booking tips</h2>
                </div>
                {tips.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {tips.map(tip => (
                      <article key={tip._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{tip.category}</p>
                        <h3 className="mt-2 font-bold text-slate-900">{tip.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{tip.description}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">Helpful trip tips will appear here.</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
