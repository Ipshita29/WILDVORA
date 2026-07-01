import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hostAPI } from '../api/hostAPI';
import Layout from '../components/Layout';

const FALLBACK_IMAGES = {
  Trekking:      'https://images.unsplash.com/photo-1551632811-561730d1e4a6?auto=format&fit=crop&w=400&q=80',
  Camping:       'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80',
  'Water Sports':'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=400&q=80',
  Jungle:        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
  Cycling:       'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80',
  Climbing:      'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=400&q=80',
  Safari:        'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80',
  Skiing:        'https://images.unsplash.com/photo-1482867996988-2faec3cbb4f9?auto=format&fit=crop&w=400&q=80',
};

const StatCard = ({ label, value, meta, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-1 shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-2xl font-extrabold text-gray-900">{value}</div>
    {meta && <div className="text-xs text-gray-400 mt-0.5">{meta}</div>}
    {children}
  </div>
);

const STATUS_PILLS = {
  confirmed: 'bg-green-50 text-green-700 border border-green-200',
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
  completed: 'bg-gray-100 text-gray-600 border border-gray-200',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = () => {
    setLoading(true);
    hostAPI.getStats()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleExportDashboard = () => {
    if (!stats) return;
    let csvContent = "data:text/csv;charset=utf-8,Month,Revenue\n";
    if (stats.revenueChart) {
      stats.revenueChart.forEach(row => {
        csvContent += `${row.month},₹${row.revenue}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wildvora_revenue_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1A5F45] border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  // Calculate chart max for visual percentages
  const maxVal = stats?.revenueChart ? Math.max(...stats.revenueChart.map(m => m.revenue), 10000) : 10000;

  return (
    <Layout>
      <div id="dashboard-page" className="max-w-6xl mx-auto space-y-6">

        {/* Greeting Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Good {greeting}, {user?.name?.split(' ')[0] || 'Host'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor occupancy, handle pending items, and view real-time booking trends.
            </p>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* Pending Actions Section */}
        {stats?.pendingActions && stats.pendingActions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              ⚡ Pending Actions Required ({stats.pendingActions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.pendingActions.map((action, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (action.type === 'confirm_bookings') navigate('/bookings');
                    if (action.type === 'update_listing') navigate(`/listings/edit/${action.referenceId}`);
                  }}
                  className="bg-white p-3 rounded-xl border border-amber-100 hover:border-amber-300 transition cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{action.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{action.message}</p>
                  </div>
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
            meta={`₹${(stats?.revenueThisMonth || 0).toLocaleString('en-IN')} this month`}
          />
          <StatCard
            label="Active Listings"
            value={stats?.totalListings || 0}
            meta={`Rated ${stats?.averageRating || 0} ★ avg`}
          />
          <StatCard
            label="Reviews & Feedback"
            value={stats?.totalReviews || 0}
            meta={`${stats?.totalReviews ? 'Read client testimonials' : 'No ratings yet'}`}
          />
          <StatCard
            label="Occupancy Rate"
            value={`${stats?.occupancyRate || 0}%`}
            meta="Slot utilization efficiency"
          >
            <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[#1A5F45] rounded-full transition-all duration-500"
                style={{ width: `${stats?.occupancyRate || 0}%` }}
              />
            </div>
          </StatCard>
        </div>

        {/* Middle Section: Revenue Chart + Upcoming Arrivals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Revenue Overview</h2>
                  <p className="text-xs text-gray-400">Monthly breakdown of bookings payouts</p>
                </div>
                <button
                  onClick={handleExportDashboard}
                  className="text-xs text-[#1A5F45] font-semibold border border-emerald-100 bg-emerald-50/50 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition"
                >
                  📤 Export CSV
                </button>
              </div>
              <div className="flex items-end gap-3 h-40 mt-6">
                {stats?.revenueChart?.map((item, i) => {
                  const pct = Math.round((item.revenue / maxVal) * 80) + 15;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <span className="absolute -top-7 text-[9px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100 z-10">
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-90 ${
                          i === stats.revenueChart.length - 1 ? 'bg-[#1A5F45]' : 'bg-[#C8E6D4]'
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                {stats?.revenueChart?.map((item, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-gray-400 font-medium">
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Arrivals */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Upcoming Bookings</h2>
                <p className="text-xs text-gray-400">Next incoming participants</p>
              </div>
              <Link to="/bookings" className="text-xs text-[#1A5F45] font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-1">
              {!stats?.upcomingBookings || stats.upcomingBookings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No upcoming bookings</p>
              ) : (
                stats.upcomingBookings.map((b) => (
                  <div key={b._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EEF6F1] text-[#1A5F45] flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {b.user?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{b.user?.name || 'Explorer'}</p>
                      <p className="text-xs text-gray-400 truncate">{b.experience?.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-gray-600">
                        {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      <span className={`text-[9px] font-semibold px-1 py-0.5 rounded capitalize ${STATUS_PILLS[b.status] || 'bg-gray-100'}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Lower Section: Popular Experiences + Customer Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Popular Experiences */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-3">🔥 Popular Experiences</h2>
            <div className="space-y-3">
              {!stats?.popularExperiences || stats.popularExperiences.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No popular experiences to show</p>
              ) : (
                stats.popularExperiences.map((exp, i) => (
                  <div key={exp._id || i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1A5F45] font-extrabold flex items-center justify-center text-xs">
                      #{i + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      <img
                        src={exp.coverImage || FALLBACK_IMAGES[exp.category] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80'}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{exp.title}</p>
                      <p className="text-xs text-gray-400">{exp.bookingCount || 0} bookings · {exp.guestCount || 0} guests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{(exp.price || 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-amber-500">★ {exp.rating ? exp.rating.toFixed(1) : 'New'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-gray-900">⭐ Customer Ratings & Reviews</h2>
              <Link to="/reviews" className="text-xs text-[#1A5F45] font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {!stats?.recentReviews || stats.recentReviews.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No reviews received yet</p>
              ) : (
                stats.recentReviews.map((rev) => (
                  <div key={rev._id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">{rev.user?.name || 'Explorer'}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{rev.experience?.title}</p>
                      </div>
                      <div className="text-amber-500 text-xs font-bold">
                        {'★'.repeat(rev.rating)}
                        <span className="text-gray-300">{'★'.repeat(5 - rev.rating)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
}