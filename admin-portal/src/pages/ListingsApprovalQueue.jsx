import { useState, useEffect } from 'react';
import { FilterIcon, CheckIcon, EyeIcon, XCircleIcon, MapPinIcon, CalIcon } from '../components/shared.jsx';
import api from '../api/axios';

const tagStyles = {
  EXPERIENCE: 'bg-sky-100 text-sky-600 border border-sky-200',
  PROPERTY:   'bg-teal-100 text-teal-600 border border-teal-200',
  EXCLUSIVE:  'bg-orange-100 text-orange-500 border border-orange-200',
};

export default function ListingsApprovalQueue() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState({});
  const [rejected, setRejected] = useState({});

  const fetchPendingListings = async () => {
    try {
      const res = await api.get('/admin/listings/pending');
      if (res.data && res.data.success) {
        const formattedListings = res.data.listings.map(l => ({
          _id: l._id,
          tag: 'EXPERIENCE',
          name: l.title,
          host: l.host?.name || l.hostName || 'Operator',
          date: new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          location: typeof l.location === 'object' ? `${l.location.city || ''}, ${l.location.country || ''}` : l.location,
          img: l.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=480&h=260&fit=crop',
          isDb: true
        }));
        setListings(formattedListings);
      }
    } catch (err) {
      console.error('Failed to fetch pending listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingListings();
  }, []);

  const handleApprove = async (id, i) => {
    const confirmApprove = window.confirm("Are you sure you want to approve this listing?");
    if (!confirmApprove) return;

    try {
      const res = await api.patch(`/admin/listings/${id}/approve`);
      if (res.data && res.data.success) {
        setApproved(p => ({ ...p, [i]: true }));
        setRejected(p => ({ ...p, [i]: false }));
        alert("Listing approved successfully!");
      }
    } catch (err) {
      console.error('Failed to approve listing:', err);
      alert(err.response?.data?.message || "Failed to approve listing.");
    }
  };

  const handleReject = async (id, i) => {
    const reason = window.prompt("Enter rejection reason / requested changes:");
    if (reason === null) return;

    try {
      const res = await api.patch(`/admin/listings/${id}/reject`, {
        status: 'rejected',
        reason: reason
      });
      if (res.data && res.data.success) {
        setRejected(p => ({ ...p, [i]: true }));
        setApproved(p => ({ ...p, [i]: false }));
        alert("Listing rejected successfully.");
      }
    } catch (err) {
      console.error('Failed to reject listing:', err);
      alert(err.response?.data?.message || "Failed to reject listing.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8" style={{ backgroundColor: '#f5f1ea' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pending Review</h1>
          <p className="text-gray-500 text-sm mt-1">
            {listings.length === 0 ? 'No new listings awaiting approval.' : `There are ${listings.length} new listing(s) awaiting approval.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 transition-all cursor-pointer"
          >
            <FilterIcon /> Filter
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 transition-all cursor-pointer"
          >
            Newest First
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading pending listings...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          All listings have been reviewed.
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-3 gap-5">
          {listings.map((l, i) => (
            <div
              key={l._id}
              className={`bg-white rounded-xl border overflow-hidden transition-all shadow-sm ${
                approved[i]
                  ? 'border-emerald-300 ring-1 ring-emerald-200'
                  : rejected[i]
                  ? 'border-red-200 opacity-60'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {/* Image */}
              <div className="relative">
                <img src={l.img} alt={l.name} className="w-full h-44 object-cover" />
                <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-0.5 rounded-full tracking-wide ${tagStyles[l.tag]}`}>
                  {l.tag}
                </span>
                {approved[i] && (
                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                    <div className="bg-emerald-500 rounded-full p-3 text-white shadow-lg">
                      <CheckIcon />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-gray-900 font-bold text-sm mb-1 truncate">{l.name}</h3>
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium mb-3">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Host: {l.host}
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-xs mb-4">
                  <span className="flex items-center gap-1">
                    <CalIcon /> {l.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon /> {l.location}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(l._id, i)}
                    disabled={approved[i] || rejected[i]}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      approved[i]
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
                    }`}
                  >
                    <CheckIcon /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(l._id, i)}
                    disabled={approved[i] || rejected[i]}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      rejected[i]
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-red-200 text-red-500 bg-white hover:bg-red-50 disabled:opacity-50'
                    }`}
                  >
                    <XCircleIcon /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}