import { useState, useEffect } from 'react';
import { FilterIcon, DownloadIcon } from '../components/shared.jsx';
import api from '../api/axios';

function StatusBadge({ status, disputed }) {
  if (disputed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-50 text-red-500 border-red-200">
        <span>⚠</span> Disputed
      </span>
    );
  }
  
  const cfg = {
    completed: { cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: '✓' },
    confirmed: { cls: 'bg-blue-50 text-blue-600 border-blue-200', icon: '✓' },
    cancelled: { cls: 'bg-red-50 text-red-600 border-red-200', icon: '✕' },
    pending:   { cls: 'bg-gray-100 text-gray-500 border-gray-200', icon: '○' },
  };
  const statusLower = status?.toLowerCase() || 'pending';
  const { cls, icon } = cfg[statusLower] || { cls: 'bg-gray-100 text-gray-500 border-gray-200', icon: '•' };
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      <span>{icon}</span> {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
    </span>
  );
}

export default function BookingsDisputes() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Bookings');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bookings');
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleToggleDispute = async (bookingId, currentDisputed) => {
    try {
      const reason = !currentDisputed ? prompt('Enter reason for dispute:') : '';
      if (!currentDisputed && reason === null) return; // Cancelled prompt
      
      const res = await api.patch(`/admin/bookings/${bookingId}/dispute`, {
        disputed: !currentDisputed,
        disputeReason: reason || ''
      });
      if (res.data?.success) {
        fetchBookings();
        alert(`Dispute status updated.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update dispute status.');
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm('Are you sure you want to issue a full refund and cancel this booking?')) return;
    try {
      const res = await api.post(`/bookings/${bookingId}/refund`);
      if (res.data?.success) {
        fetchBookings();
        alert('Refund issued successfully.');
      }
    } catch (err) {
      // try admin fallback endpoint if regular doesn't match
      try {
        const adminRes = await api.post(`/admin/bookings/${bookingId}/refund`);
        if (adminRes.data?.success) {
          fetchBookings();
          alert('Refund issued successfully.');
        }
      } catch (adminErr) {
        alert(adminErr.response?.data?.message || 'Failed to issue refund.');
      }
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.experience?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b._id || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (activeTab === 'Disputed') return b.disputed === true;
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const totalDisputes = bookings.filter(b => b.disputed).length;
  const totalCompleted = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8" style={{ backgroundColor: '#f5f1ea' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bookings & Disputes</h1>
          <p className="text-gray-500 text-sm mt-1">Oversee global transactions and resolve platform conflicts.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search booking ID, customer or listing..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
          />
          <button 
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="text-gray-400 text-xs font-semibold tracking-widest mb-2 uppercase">Total Bookings</div>
          <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="text-gray-400 text-xs font-semibold tracking-widest mb-2 uppercase">Active Disputes</div>
          <div className={`text-2xl font-bold ${totalDisputes > 0 ? 'text-red-600' : 'text-gray-900'}`}>{totalDisputes}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="text-gray-400 text-xs font-semibold tracking-widest mb-2 uppercase">Paid Marketplace Revenue</div>
          <div className="text-2xl font-bold text-emerald-700">₹{totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        {/* Tabs row */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            {['All Bookings', 'Disputed', 'Cancelled'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'Disputed' && totalDisputes > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                {t}
              </button>
            ))}
          </div>
          <div className="ml-auto text-gray-400 text-xs">
            Showing {filteredBookings.length} booking(s)
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading bookings from system...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <div className="text-4xl mb-2">📄</div>
            <p className="font-bold text-gray-600 text-lg">No Bookings Found</p>
            <p className="text-gray-400 text-sm mt-1">No database records match the selected view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Booking ID', 'Customer', 'Listing', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/60 transition-all">
                    <td className="px-5 py-4 text-gray-700 text-xs font-mono font-semibold">
                      #{b._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {b.user?.name ? b.user.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="text-gray-800 text-sm font-semibold leading-tight">{b.user?.name || 'Customer'}</div>
                          <div className="text-gray-400 text-xs">{b.user?.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-sm max-w-xs truncate">{b.experience?.title || 'Wild Adventure'}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs leading-relaxed">
                      {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-bold text-sm">₹{b.totalPrice.toLocaleString()}</td>
                    <td className="px-5 py-4"><StatusBadge status={b.status} disputed={b.disputed} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleToggleDispute(b._id, b.disputed)}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all border cursor-pointer ${
                            b.disputed 
                              ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {b.disputed ? 'Resolve Dispute' : 'Flag Dispute'}
                        </button>
                        {b.paymentStatus === 'paid' && b.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleRefund(b._id)}
                            className="text-xs text-rose-600 border border-rose-200 px-2.5 py-1 rounded-md hover:bg-rose-50 font-semibold transition-all cursor-pointer"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}