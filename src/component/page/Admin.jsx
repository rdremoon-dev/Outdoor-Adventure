import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareText,
  Pencil,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { API_URL, apiRequest } from '../../lib/api';

const adminTokenKey = 'outdoor_admin_token';
const adventures = [
  'Backpacking Trips',
  'Family Hiking Trips',
  'Water Sports & Kayaking',
  'Winter Alpine Sports',
];
const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50';
const statusClass = {
  pending: 'bg-amber-50 text-amber-800',
  confirmed: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-rose-50 text-rose-800',
};
const dateLabel = value =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not set';

function exportCsv(rows) {
  const columns = [
    'Reference', 'Customer', 'Email', 'Phone', 'Adventure', 'Date', 'Guests',
    'Booking status', 'Payment status', 'Payment amount', 'Currency',
    'Transaction ID', 'Requested at', 'Message',
  ];
  const values = rows.map(booking => [
    String(booking._id || '').slice(-8).toUpperCase(),
    booking.customerName,
    booking.email,
    booking.phone,
    booking.adventure,
    booking.bookingDate ? new Date(booking.bookingDate).toISOString().slice(0, 10) : '',
    booking.guests,
    booking.status,
    booking.paymentStatus || 'not_configured',
    booking.paymentAmount ?? '',
    booking.paymentCurrency || '',
    booking.transactionId || '',
    booking.createdAt ? new Date(booking.createdAt).toISOString() : '',
    booking.message || '',
  ]);
  const csv = [columns, ...values]
    .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `outdoor-adventure-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
        </div>
        <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

export default function Admin({ showToast }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(adminTokenKey) || '');
  const [section, setSection] = useState('bookings');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [adventureFilter, setAdventureFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newBookingCount, setNewBookingCount] = useState(0);
  const [tips, setTips] = useState([]);
  const [tipForm, setTipForm] = useState({
    title: '',
    description: '',
    category: 'General',
    active: true,
  });
  const [editingTip, setEditingTip] = useState('');
  const [profile, setProfile] = useState({ email: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [error, setError] = useState('');
  const toastRef = useRef(showToast);
  useEffect(() => {
    toastRef.current = showToast;
  }, [showToast]);

  const loadBookings = useCallback(async (authToken = token) => {
    if (!authToken) return;
    const data = await apiRequest('/api/bookings', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setBookings(data.bookings || []);
  }, [token]);

  const loadTips = useCallback(async () => {
    const data = await apiRequest('/api/tips/admin', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTips(data.tips || []);
  }, [token]);

  const loadProfile = useCallback(async () => {
    const data = await apiRequest('/api/auth/admin/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProfile(data.profile);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([loadBookings(token), loadTips(), loadProfile()])
      .catch(err => {
        if (!active) return;
        setError(err.message);
        if (/session expired|login required/i.test(err.message)) {
          sessionStorage.removeItem(adminTokenKey);
          setToken('');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, loadBookings, loadTips, loadProfile]);

  useEffect(() => {
    if (!token) {
      setLiveConnected(false);
      return undefined;
    }
    const socket = io(API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('connect', () => setLiveConnected(true));
    socket.on('disconnect', () => setLiveConnected(false));
    socket.on('connect_error', err => {
      setLiveConnected(false);
      console.warn('Live notifications unavailable:', err.message);
    });
    socket.on('booking:new', notice => {
      setNewBookingCount(count => count + 1);
      toastRef.current?.(`New booking request: ${notice.customerName} — ${notice.adventure}`);
      loadBookings(token).catch(err => setError(err.message));
    });
    socket.on('booking:updated', () => loadBookings(token).catch(err => setError(err.message)));
    socket.on('payment:updated', () => loadBookings(token).catch(err => setError(err.message)));
    return () => {
      socket.disconnect();
      setLiveConnected(false);
    };
  }, [token, loadBookings]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem(adminTokenKey, data.token);
      setToken(data.token);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadBookings(), loadTips()]);
      setNewBookingCount(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(id, status) {
    setError('');
    try {
      await apiRequest(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      await loadBookings();
      showToast?.(`Booking ${status}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  function resetTipForm() {
    setTipForm({ title: '', description: '', category: 'General', active: true });
    setEditingTip('');
  }

  function editTip(tip) {
    setTipForm({
      title: tip.title,
      description: tip.description,
      category: tip.category || 'General',
      active: tip.active,
    });
    setEditingTip(tip._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveTip(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiRequest(editingTip ? `/api/tips/${editingTip}` : '/api/tips', {
        method: editingTip ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(tipForm),
      });
      await loadTips();
      resetTipForm();
      showToast?.(editingTip ? 'Booking tip updated.' : 'Booking tip created.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTip(tip) {
    if (!window.confirm(`Delete "${tip.title}"?`)) return;
    setError('');
    try {
      await apiRequest(`/api/tips/${tip._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTips(current => current.filter(item => item._id !== tip._id));
      if (editingTip === tip._id) resetTipForm();
      showToast?.('Booking tip deleted.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveAdminProfile(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/api/auth/admin/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      setProfile(data.profile);
      showToast?.(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem(adminTokenKey);
    setToken('');
    setBookings([]);
    setTips([]);
    setProfile({ email: '', name: '', phone: '' });
    setSection('bookings');
  }

  const visibleBookings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const now = new Date();
    return bookings
      .filter(booking => {
        if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
        if (adventureFilter !== 'all' && booking.adventure !== adventureFilter) return false;
        if (needle && ![booking.customerName, booking.email, booking.phone, booking.adventure, booking._id]
          .some(value => String(value || '').toLowerCase().includes(needle))) return false;
        if (dateFilter !== 'all') {
          const date = new Date(booking.bookingDate);
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          if (dateFilter === 'upcoming' && (day < today || booking.status === 'cancelled')) return false;
          if (dateFilter === 'past' && day >= today) return false;
          if (dateFilter === 'today' && day.getTime() !== today.getTime()) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sort === 'date'
          ? new Date(a.bookingDate) - new Date(b.bookingDate)
          : sort === 'oldest'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt),
      );
  }, [bookings, query, statusFilter, adventureFilter, dateFilter, sort]);
  const pendingCount = bookings.filter(item => item.status === 'pending').length;
  const confirmedCount = bookings.filter(item => item.status === 'confirmed').length;
  const paidCount = bookings.filter(item => item.paymentStatus === 'paid').length;
  const nextBookings = [...bookings]
    .filter(item => item.status !== 'cancelled' && new Date(item.bookingDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))
    .slice(0, 4);

  if (!token) {
    return (
      <section className="relative min-h-[75vh] overflow-hidden bg-slate-950 px-4 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-7 w-7" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Private operations</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Welcome back.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to manage reservations, booking tips, and your profile.</p>
          <form className="mt-7 space-y-4" onSubmit={handleLogin}>
            <label className="block text-sm font-semibold text-slate-700">Admin email<input type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className={inputClass} /></label>
            <label className="block text-sm font-semibold text-slate-700">Password<input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className={inputClass} /></label>
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <button disabled={loading} className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in securely'}</button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">Protected administrator access · Sessions expire automatically</p>
        </div>
      </section>
    );
  }

  const nav = [
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'tips', label: 'Booking tips', icon: Sparkles },
    { id: 'profile', label: 'Admin profile', icon: UserRound },
  ];

  return (
    <section className="min-h-[80vh] bg-[#f6f8f7] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200"><ShieldCheck className="h-6 w-6" /></span>
            <div><p className="text-sm font-bold">Adventure ops</p><p className="text-xs text-slate-400">Administrator</p></div>
          </div>
          <nav className="mt-4 space-y-1">
            {nav.map(item => (
              <button key={item.id} onClick={() => { setSection(item.id); setError(''); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === item.id ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}>
                <item.icon className="h-4 w-4" />{item.label}
              </button>
            ))}
          </nav>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-xs">
            <Radio className={`h-4 w-4 ${liveConnected ? 'text-emerald-300' : 'text-amber-300'}`} />
            {liveConnected ? 'Live updates connected' : 'Live updates offline'}
          </div>
          <button onClick={logout} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-rose-500/15 hover:text-rose-200"><LogOut className="h-4 w-4" /> Sign out</button>
        </aside>

        <main className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-950 p-6 text-white shadow-lg sm:p-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Adventure operations</div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{nav.find(item => item.id === section)?.label}</h1>
              <p className="mt-2 text-sm text-slate-300">{section === 'bookings' ? 'Manage reservations, guest schedules, and payment status.' : section === 'tips' ? 'Create and maintain helpful customer booking tips.' : 'Manage the administrator contact profile.'}</p>
            </div>
            <div className="flex items-center gap-2">
              {newBookingCount > 0 && <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-400/15 px-3 py-2.5 text-xs font-bold text-emerald-100"><Bell className="h-4 w-4" />{newBookingCount} new</span>}
              <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
            </div>
          </header>
          {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

          {section === 'bookings' && (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat icon={LayoutDashboard} label="Reservations" value={bookings.length} note="All booking requests" />
                <Stat icon={CalendarDays} label="Awaiting review" value={pendingCount} note="Needs availability confirmation" />
                <Stat icon={CheckCircle2} label="Confirmed trips" value={confirmedCount} note="Approved by staff" />
                <Stat icon={CircleDollarSign} label="Payments received" value={paidCount} note="Verified payments" />
              </div>
              <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
                  <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Reservation manager</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">All bookings</h2></div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => exportCsv(visibleBookings)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Export</button>
                    <label className="relative block w-full sm:w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search bookings…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></label>
                  </div>
                </div>
                <div className="grid gap-2 border-b border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="relative"><SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><select aria-label="Filter by status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></label>
                  <label className="relative"><select aria-label="Filter by adventure" value={adventureFilter} onChange={event => setAdventureFilter(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm"><option value="all">All adventures</option>{adventures.map(adventure => <option key={adventure}>{adventure}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></label>
                  <label className="relative"><select aria-label="Filter by trip date" value={dateFilter} onChange={event => setDateFilter(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm"><option value="all">All dates</option><option value="today">Today</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></label>
                  <label className="relative"><select aria-label="Sort bookings" value={sort} onChange={event => setSort(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm"><option value="newest">Newest received</option><option value="oldest">Oldest received</option><option value="date">Trip date: soonest</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></label>
                </div>
                {visibleBookings.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Adventure</th><th className="px-5 py-3">Date / guests</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Update</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleBookings.map(booking => (
                          <tr key={booking._id} onClick={() => setSelectedBooking(booking)} className="align-top cursor-pointer hover:bg-slate-50">
                            <td className="px-5 py-4"><p className="font-bold text-slate-900">{booking.customerName}</p><p className="mt-1 text-xs text-slate-500">{booking.email}</p><p className="text-xs text-slate-500">{booking.phone}</p></td>
                            <td className="px-5 py-4 font-medium text-slate-700">{booking.adventure}</td>
                            <td className="px-5 py-4 text-slate-600">{new Date(booking.bookingDate).toLocaleDateString()}<p className="mt-1 text-xs">{booking.guests} guest{booking.guests === 1 ? '' : 's'}</p></td>
                            <td className="px-5 py-4"><span className="capitalize text-slate-700">{(booking.paymentStatus || 'not configured').replace('_', ' ')}</span><p className="mt-1 text-xs text-slate-500">{booking.paymentAmount == null ? '—' : new Intl.NumberFormat(undefined, { style: 'currency', currency: booking.paymentCurrency || 'USD' }).format(booking.paymentAmount)}</p></td>
                            <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass[booking.status] || 'bg-slate-100 text-slate-600'}`}>{booking.status}</span></td>
                            <td className="px-5 py-4"><select aria-label={`Update status for ${booking.customerName}`} value={booking.status} onClick={event => event.stopPropagation()} onChange={event => updateBookingStatus(booking._id, event.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-700"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="p-8 text-center text-sm text-slate-500">{bookings.length ? 'No bookings match your search.' : 'No booking requests yet.'}</p>}
              </div>
              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-emerald-700" /><h2 className="font-extrabold text-slate-900">Upcoming reservations</h2></div>
                {nextBookings.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{nextBookings.map(booking => <button key={booking._id} onClick={() => setSelectedBooking(booking)} className="rounded-2xl border border-slate-100 p-4 text-left hover:border-emerald-200 hover:bg-emerald-50/40"><p className="font-bold text-slate-900">{booking.customerName}</p><p className="mt-1 text-xs text-slate-500">{booking.adventure}</p><p className="mt-2 text-xs font-semibold text-emerald-800">{dateLabel(booking.bookingDate)} · {booking.guests} guests</p></button>)}</div> : <p className="mt-3 text-sm text-slate-500">No upcoming trips are scheduled.</p>}
              </div>
            </>
          )}

          {section === 'tips' && (
            <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(280px,.8fr)_minmax(0,1.2fr)]">
              <form onSubmit={saveTip} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">{editingTip ? 'Edit tip' : 'New tip'}</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">{editingTip ? 'Update booking tip' : 'Create booking tip'}</h2></div>
                  {editingTip && <button type="button" aria-label="Cancel editing" onClick={resetTipForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>}
                </div>
                <label className="mt-5 block text-sm font-semibold text-slate-700">Title<input className={inputClass} required maxLength={120} value={tipForm.title} onChange={event => setTipForm({ ...tipForm, title: event.target.value })} /></label>
                <label className="mt-4 block text-sm font-semibold text-slate-700">Category<input className={inputClass} required maxLength={60} value={tipForm.category} onChange={event => setTipForm({ ...tipForm, category: event.target.value })} /></label>
                <label className="mt-4 block text-sm font-semibold text-slate-700">Description<textarea className={inputClass} required maxLength={1000} rows={5} value={tipForm.description} onChange={event => setTipForm({ ...tipForm, description: event.target.value })} /></label>
                <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={tipForm.active} onChange={event => setTipForm({ ...tipForm, active: event.target.checked })} className="h-4 w-4 accent-emerald-700" />Show to customers</label>
                <div className="mt-5 flex gap-2">
                  <button disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"><Plus className="h-4 w-4" />{editingTip ? 'Save changes' : 'Create tip'}</button>
                  {editingTip && <button type="button" onClick={resetTipForm} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>}
                </div>
              </form>
              <div className="space-y-3">
                {tips.length ? tips.map(tip => (
                  <article key={tip._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{tip.category}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${tip.active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{tip.active ? 'Visible' : 'Hidden'}</span></div>
                        <h3 className="mt-2 font-bold text-slate-900">{tip.title}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{tip.description}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => editTip(tip)} aria-label={`Edit ${tip.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => deleteTip(tip)} aria-label={`Delete ${tip.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                )) : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><Sparkles className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-3 font-semibold text-slate-700">No booking tips created</p><p className="mt-1 text-sm text-slate-500">Use the form to publish helpful advice to customers.</p></div>}
              </div>
            </div>
          )}

          {section === 'profile' && (
            <form onSubmit={saveAdminProfile} className="mt-5 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Users className="h-5 w-5" /></span><div><h2 className="font-extrabold text-slate-900">Administrator profile</h2><p className="text-sm text-slate-500">Manage the contact details associated with this admin account.</p></div></div>
              <label className="block text-sm font-semibold text-slate-700">Account email<input className={`${inputClass} bg-slate-50 text-slate-500`} value={profile.email} readOnly /></label>
              <label className="mt-4 block text-sm font-semibold text-slate-700">Display name<input className={inputClass} maxLength={100} value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} /></label>
              <label className="mt-4 block text-sm font-semibold text-slate-700">Contact phone<input className={inputClass} maxLength={30} value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} /></label>
              <p className="mt-4 text-xs leading-5 text-slate-500">Admin sign-in credentials are managed in the server environment and cannot be changed here.</p>
              <button disabled={loading} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">Save profile</button>
            </form>
          )}
          {selectedBooking && section === 'bookings' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
              <div role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8" onClick={event => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Booking reference {String(selectedBooking._id).slice(-8).toUpperCase()}</p><h2 id="booking-detail-title" className="mt-2 text-2xl font-extrabold text-slate-900">{selectedBooking.customerName}</h2></div>
                  <button aria-label="Close booking details" onClick={() => setSelectedBooking(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-sm text-slate-600"><Mail className="h-4 w-4 text-emerald-700" />{selectedBooking.email}</p>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><Phone className="h-4 w-4 text-emerald-700" />{selectedBooking.phone}</p>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarCheck2 className="h-4 w-4 text-emerald-700" />{dateLabel(selectedBooking.bookingDate)} · {selectedBooking.guests} guests</p>
                  <p className="flex items-center gap-2 text-sm text-slate-600"><CircleDollarSign className="h-4 w-4 text-emerald-700" />{selectedBooking.paymentStatus || 'not configured'} · {selectedBooking.paymentAmount == null ? '—' : new Intl.NumberFormat(undefined, { style: 'currency', currency: selectedBooking.paymentCurrency || 'USD' }).format(selectedBooking.paymentAmount)}</p>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">{selectedBooking.adventure}</p>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><MessageSquareText className="h-4 w-4" />Customer message</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedBooking.message || 'No message provided.'}</p></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
