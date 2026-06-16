import { useState, useEffect } from 'react';
import { TrendUp, TrendDown } from '../components/shared.jsx';
import api from '../api/axios';

// ─── Inline status badge (pill style matching screenshot) ─────────────────────
function BookingBadge({ status }) {
  if (status?.toLowerCase() === 'confirmed' || status === 'Confirmed') {
    return (
      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full animate-pulse-subtle" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
        Confirmed
      </span>
    );
  }
  if (status?.toLowerCase() === 'completed' || status === 'Completed') {
    return (
      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
        Completed
      </span>
    );
  }
  if (status?.toLowerCase() === 'cancelled' || status === 'Cancelled') {
    return (
      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#f3ede3', color: '#92693a' }}>
      {status || 'Pending'}
    </span>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalBookings: 2482,
    gmv: 3412900,
    activeHosts: 854,
    activeCustomers: 12105,
    bookingGrowth: 12.5,
    gmvGrowth: 8.2,
    activeHostsGrowth: 3.1,
    activeCustomersGrowth: -1.4,
  });

  const [recentBookings, setRecentBookings] = useState([
    {
      listing: 'Aspen Peak Cabin',
      host: 'Sarah Jenkins',
      date: 'Oct 24, 2023',
      status: 'Confirmed',
      amount: '₹1,03,200',
      img: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=64&h=64&fit=crop',
    },
    {
      listing: 'Stillwater Basin',
      host: 'Marcus Thorne',
      date: 'Oct 23, 2023',
      status: 'Pending',
      amount: '₹70,850',
      img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=64&h=64&fit=crop',
    },
    {
      listing: 'Canyon Vista Loft',
      host: 'Elena Rodriguez',
      date: 'Oct 22, 2023',
      status: 'Confirmed',
      amount: '₹1,74,900',
      img: 'https://images.unsplash.com/photo-1488415032361-b7e238421f1b?w=64&h=64&fit=crop',
    },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      bg: 'bg-emerald-100',
      dot: 'bg-emerald-500',
      icon: (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      title: 'New Host Application',
      desc: "Dave Miller applied for 'Pine Valley Estate'",
      time: '2 mins ago',
    },
    {
      bg: 'bg-blue-100',
      dot: 'bg-blue-400',
      icon: (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2}>
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      title: 'Payout Processed',
      desc: '₹3,49,800 sent to Host #8821',
      time: '1 hour ago',
    },
    {
      bg: 'bg-rose-100',
      dot: 'bg-rose-400',
      icon: (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth={2}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: 'Support Ticket',
      desc: "Guest reported heating issue at 'Frost Cabin'",
      time: '3 hours ago',
    },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, bookingsRes, notifRes] = await Promise.all([
          api.get('/admin/analytics/overview'),
          api.get('/admin/bookings'),
          api.get('/notifications'),
        ]);

        if (overviewRes.data && overviewRes.data.success) {
          const stats = overviewRes.data.analytics;
          setStatsData({
            totalBookings: stats.totalBookings,
            gmv: stats.gmv,
            activeHosts: stats.activeHosts,
            activeCustomers: stats.activeCustomers,
            bookingGrowth: stats.bookingGrowth,
            gmvGrowth: stats.gmvGrowth,
            activeHostsGrowth: 3.1, // Fallback growth stats
            activeCustomersGrowth: -1.4,
          });
        }

        if (bookingsRes.data && bookingsRes.data.success) {
          const bList = bookingsRes.data.bookings.slice(0, 3).map(b => ({
            listing: b.experience?.title || 'Wild Adventure',
            host: b.experience?.hostName || 'Guide',
            date: new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: b.status,
            amount: `₹${b.totalPrice.toLocaleString()}`,
            img: b.experience?.images?.[0] || 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=64&h=64&fit=crop',
          }));
          if (bList.length > 0) {
            setRecentBookings(bList);
          }
        }

        if (notifRes.data && notifRes.data.success) {
          const nList = notifRes.data.notifications.slice(0, 3).map(n => {
            let bg = 'bg-sky-100';
            let dot = 'bg-sky-500';
            let strokeColor = '#0284c7';
            if (n.type === 'booking') {
              bg = 'bg-emerald-100';
              dot = 'bg-emerald-500';
              strokeColor = '#059669';
            } else if (n.type === 'listing') {
              bg = 'bg-amber-100';
              dot = 'bg-amber-500';
              strokeColor = '#d97706';
            }
            return {
              bg,
              dot,
              icon: (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={2}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: n.title,
              desc: n.desc,
              time: 'Just now',
            };
          });
          if (nList.length > 0) {
            setRecentActivity(nList);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsList = [
    {
      label: 'Total Bookings',
      value: statsData.totalBookings.toLocaleString(),
      change: `${statsData.bookingGrowth >= 0 ? '+' : ''}${statsData.bookingGrowth}%`,
      up: statsData.bookingGrowth >= 0,
      vs: 'vs. last week',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1A5F45" strokeWidth={1.8}>
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: 'GMV',
      value: `₹${statsData.gmv.toLocaleString()}`,
      change: `${statsData.gmvGrowth >= 0 ? '+' : ''}${statsData.gmvGrowth}%`,
      up: statsData.gmvGrowth >= 0,
      vs: 'vs. last week',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1A5F45" strokeWidth={1.8}>
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      ),
    },
    {
      label: 'Active Hosts',
      value: statsData.activeHosts.toLocaleString(),
      change: `${statsData.activeHostsGrowth >= 0 ? '+' : ''}${statsData.activeHostsGrowth}%`,
      up: statsData.activeHostsGrowth >= 0,
      vs: 'vs. last week',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#c0874a" strokeWidth={1.8}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: 'Active Customers',
      value: statsData.activeCustomers.toLocaleString(),
      change: `${statsData.activeCustomersGrowth >= 0 ? '+' : ''}${statsData.activeCustomersGrowth}%`,
      up: statsData.activeCustomersGrowth >= 0,
      vs: 'vs. last week',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1A5F45" strokeWidth={1.8}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#f0f2ef' }}>
      {/* ── Hero Banner ── */}
      <div className="relative" style={{ height: '240px' }}>
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&h=480&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.52)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 70%)' }}
        />
        <div className="relative px-8 pt-14">
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome Back, Alex.
          </h1>
          <p className="text-white/65 text-sm mt-2.5 leading-relaxed max-w-sm">
            The reserves are seeing high activity this morning. Monitor registrations, check listing approval requests and manage payouts.
          </p>
        </div>
      </div>

      {/* ── Stat Cards (overlap hero) ── */}
      <div className="px-8 pt-6 pb-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statsList.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border"
              style={{
                borderColor: '#e4e8e4',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#f0f5f1' }}
                >
                  {s.icon}
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-bold ${s.up ? 'text-emerald-600' : 'text-rose-500'}`}
                >
                  {s.up ? <TrendUp /> : <TrendDown />} {s.change}
                </span>
              </div>
              <div className="text-gray-500 text-xs font-medium mb-1">{s.label}</div>
              <div className="text-gray-900 text-2xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-gray-400 text-xs mt-1">{s.vs}</div>
            </div>
          ))}
        </div>

        {/* ── Bottom Section ── */}
        <div className="grid grid-cols-5 gap-6">
          {/* Recent Bookings */}
          <div
            className="col-span-3 bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: '#e4e8e4', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: '#f0f2f0' }}
            >
              <h2 className="text-gray-900 font-bold text-base">Recent Bookings</h2>
            </div>

            {/* Column headers */}
            <div
              className="grid px-6 py-3 text-xs font-semibold border-b"
              style={{
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.1fr',
                color: '#9ca3af',
                borderColor: '#f0f2f0',
              }}
            >
              <span>Listing</span>
              <span>Host</span>
              <span>Date</span>
              <span>Status</span>
              <span>Amount</span>
            </div>

            {/* Rows */}
            <div className="divide-y" style={{ borderColor: '#f0f2f0' }}>
              {recentBookings.map((b, i) => (
                <div
                  key={i}
                  className="grid items-center px-6 py-4 hover:bg-gray-50/70 transition-all cursor-pointer"
                  style={{
                    gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.1fr',
                    borderColor: '#f0f2f0',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={b.img}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                      style={{ border: '1px solid #e4e8e4' }}
                    />
                    <span className="text-gray-800 text-sm font-semibold leading-snug truncate">{b.listing}</span>
                  </div>
                  <span className="text-gray-600 text-sm truncate">{b.host}</span>
                  <span className="text-gray-400 text-xs">{b.date}</span>
                  <span><BookingBadge status={b.status} /></span>
                  <span className="text-gray-900 font-bold text-sm">{b.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="col-span-2 bg-white rounded-2xl border overflow-hidden flex flex-col"
            style={{ borderColor: '#e4e8e4', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <div
              className="px-6 py-5 border-b"
              style={{ borderColor: '#f0f2f0' }}
            >
              <h2 className="text-gray-900 font-bold text-base">Recent Activity</h2>
            </div>

            <div className="flex-1 divide-y px-6" style={{ borderColor: '#f0f2f0' }}>
              {recentActivity.map((a, i) => (
                <div key={i} className="flex gap-4 py-5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.bg}`}
                  >
                    {a.icon}
                  </div>
                  <div>
                    <div className="text-gray-900 text-sm font-semibold leading-snug">{a.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{a.desc}</div>
                    <div className="text-gray-400 text-xs mt-1">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}