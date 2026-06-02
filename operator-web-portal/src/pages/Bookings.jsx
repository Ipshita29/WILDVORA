import { useState, useEffect } from 'react';
import { hostAPI } from '../api/hostAPI';
import Layout from '../components/Layout';

const TABS = ['All Bookings', 'Requests', 'Canceled'];

export default function Bookings() {
  const [bookings, setBookings]     = useState([]);
  const [tab, setTab]               = useState('All Bookings');
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [updating, setUpdating]     = useState(false);
  const [page, setPage]             = useState(1);
  const PER_PAGE = 10;

  const fetchBookings = async (statusFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter === 'Requests') params.status = 'pending';
      else if (statusFilter === 'Canceled') params.status = 'cancelled';
      const res = await hostAPI.getBookings(params);
      setBookings(res.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(tab); }, [tab]);

  const handleStatus = async (id, status) => {
    setUpdating(true);
    try {
      const res = await hostAPI.updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b._id === id ? res.data.booking : b));
      setSelected(res.data.booking);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setUpdating(false);
    }
  };

  const paginated = bookings.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(bookings.length / PER_PAGE);

  // Stats calculation
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const occupancyRate = 92; // Mocked occupancy rate matching mockup
  const revPar = 245; // Mocked RevPAR matching mockup

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">PENDING</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">CONFIRMED</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100">COMPLETED</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">CANCELLED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600">{status}</span>;
    }
  };

  const getAvatarBg = (name) => {
    const char = name?.[0]?.toUpperCase() || 'A';
    const colors = [
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-rose-100 text-rose-700',
      'bg-purple-100 text-purple-700'
    ];
    return colors[char.charCodeAt(0) % colors.length];
  };

  return (
    <Layout>
      <div className="relative min-h-full flex">
        {/* Main Content Area */}
        <div className="flex-1 pr-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your upcoming adventure reservations and guest interactions.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-600 font-medium shadow-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>Oct 12 - Oct 28, 2023</span>
              </div>
              <button className="flex items-center justify-center bg-white border border-gray-200 rounded-xl p-2.5 text-gray-500 hover:bg-gray-50 shadow-sm transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button 
                id="btn-export-bookings" 
                onClick={() => alert('Exporting bookings...')} 
                className="flex items-center gap-2 bg-[#7BD5FE] hover:bg-[#6ac7f0] text-white font-semibold rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0L8 7m4-4l4 4"/>
                </svg>
                <span>Export</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm" role="alert">
              {error}
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border-l-[4px] border-[#105D3D] shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Total Bookings</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">{totalCount.toLocaleString()}</span>
                <span className="text-xs font-semibold text-emerald-600">+12% from last month</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border-l-[4px] border-[#7BD5FE] shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Pending</span>
              <div className="mt-1">
                <span className="text-2xl font-bold text-gray-900">{pendingCount}</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border-l-[4px] border-[#C4A482] shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Occupancy Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">{occupancyRate}%</span>
                <span className="text-xs font-semibold text-[#C4A482]">Peak season trend</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border-l-[4px] border-gray-400 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">RevPAR</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">${revPar}</span>
                <span className="text-xs font-semibold text-gray-400">Average per slot</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs & Pagination Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div className="flex gap-4">
                {TABS.map(t => (
                  <button
                    key={t}
                    id={`tab-${t.replace(' ', '-').toLowerCase()}`}
                    className={`pb-2 text-sm font-semibold border-b-2 transition ${
                      tab === t ? 'border-[#105D3D] text-[#105D3D]' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                    onClick={() => { setTab(t); setPage(1); setSelected(null); }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-400">
                Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, bookings.length)} of {bookings.length} results
              </span>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading bookings...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-6">Customer Name</th>
                      <th className="py-3 px-6">Booking ID</th>
                      <th className="py-3 px-6">Experience</th>
                      <th className="py-3 px-6">Dates</th>
                      <th className="py-3 px-6">Amount</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">No bookings found.</td>
                      </tr>
                    ) : paginated.map(b => (
                      <tr
                        key={b._id}
                        className={`hover:bg-gray-50/50 cursor-pointer transition ${selected?._id === b._id ? 'bg-gray-50' : ''}`}
                        onClick={() => setSelected(b)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarBg(b.user?.name)}`}>
                              {b.user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{b.user?.name}</div>
                              <div className="text-[11px] text-gray-400">{b.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-500">
                          #WV-{b._id.slice(-4).toUpperCase()}
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-700">
                          {b.experience?.title}
                        </td>
                        <td className="py-4 px-6 text-[11px] font-semibold text-gray-500 leading-tight">
                          {new Date(b.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          <div className="text-[9px] text-gray-400 font-normal mt-0.5">08:00 AM</div>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-gray-900">
                          ${b.totalPrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(b.status)}
                        </td>
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelected(b)}
                            className="text-gray-400 hover:text-gray-600 transition"
                          >
                            <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition"
                >
                  &larr; Previous
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition ${
                        page === n ? 'bg-[#105D3D] text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Details Panel */}
        {selected && (
          <div className="w-[380px] bg-white border-l border-gray-100 shadow-2xl flex flex-col h-full sticky top-0 overflow-y-auto z-10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
              <button 
                onClick={() => setSelected(null)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              {selected.status === 'pending' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 tracking-wider">AWAITING CONFIRMATION</span>
              ) : selected.status === 'confirmed' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 tracking-wider font-semibold">CONFIRMED</span>
              ) : selected.status === 'completed' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-100 tracking-wider font-semibold">COMPLETED</span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 tracking-wider font-semibold">CANCELLED</span>
              )}
            </div>

            {/* Customer Details */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${getAvatarBg(selected.user?.name)}`}>
                {selected.user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{selected.user?.name}</h3>
                <p className="text-xs font-semibold text-gray-400">Verified Adventure Seeker</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-[11px] font-semibold text-gray-500">4.9 (12 Previous Trips)</span>
                </div>
              </div>
            </div>

            {/* Details Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Booking ID</span>
                <strong className="text-xs text-gray-800">#WV-{selected._id.slice(-4).toUpperCase()}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</span>
                <strong className="text-xs text-gray-800">
                  {new Date(selected.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • 08:00 AM
                </strong>
              </div>
            </div>

            {/* Experience Package */}
            <div className="mb-6">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Experience Package</span>
              <div className="flex gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <img 
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=150&q=80" 
                  alt="Experience" 
                  className="w-12 h-12 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-800">{selected.experience?.title}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Intermediate Difficulty &bull; 6 Hours</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-8">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Summary</span>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-semibold">Experience Base Fee</span>
                <strong className="text-sm text-gray-900">${selected.totalPrice.toFixed(2)}</strong>
              </div>
            </div>

            {/* Actions */}
            {selected.status === 'pending' && (
              <div className="flex gap-3 mt-auto">
                <button
                  disabled={updating}
                  onClick={() => handleStatus(selected._id, 'cancelled')}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                  Reject Booking
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleStatus(selected._id, 'confirmed')}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#105D3D] hover:bg-[#0c4e32] text-xs font-bold text-white transition shadow-sm"
                >
                  Confirm Booking
                </button>
              </div>
            )}
            
            {selected.status === 'confirmed' && (
              <div className="flex gap-3 mt-auto">
                <button
                  disabled={updating}
                  onClick={() => handleStatus(selected._id, 'cancelled')}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleStatus(selected._id, 'completed')}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#105D3D] hover:bg-[#0c4e32] text-xs font-bold text-white transition shadow-sm"
                >
                  Mark Completed
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

