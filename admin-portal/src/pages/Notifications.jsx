import { useState, useEffect } from 'react';
import api from '../api/axios';

const CATEGORIES = [
  { label: 'All Activity', id: 'all' },
  { label: 'Host Alerts', id: 'host' },
  { label: 'Payout Approvals', id: 'payout' },
  { label: 'Listing Reviews', id: 'listing' },
  { label: 'System Alerts', id: 'system' }
];

const getIcon = (type) => {
  switch (type) {
    case 'listing':
      return (
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'payout':
      return (
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20M12 14v-4" />
          </svg>
        </div>
      );
    case 'host':
      return (
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4-4-4-4" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      );
  }
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
};

export default function Notifications() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data && response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeCategory);

  const getCount = (catId) => {
    if (catId === 'all') return notifications.length;
    return notifications.filter(n => n.type === catId).length;
  };

  return (
    <div className="px-8 py-8 flex flex-col font-sans">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Stay updated on platform activity and administrative tasks.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl px-4 py-2.5 text-sm shadow-sm hover:bg-gray-50 transition cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Main Grid split */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Left Column Categories */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 space-y-1">
              <span className="block text-[10px] font-bold text-[#1A5F45] uppercase tracking-wider px-3 mb-2">Categories</span>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-emerald-50 text-[#1A5F45]'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeCategory === cat.id ? 'bg-[#1A5F45] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getCount(cat.id)}
                  </span>
                </button>
              ))}
            </div>

            {/* Platform Health Card */}
            <div className="bg-[#EBF5FC] rounded-2xl p-5 border border-sky-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Platform Health</span>
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2.5">99.98%</div>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Uptime this week</p>
            </div>
          </div>

          {/* Right Column Recent Updates list (Span 2) */}
          <div className="col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recent Activity</span>
              <span className="text-[10px] text-gray-400 font-semibold">Showing last 24 hours</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-sm text-gray-500">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">No notifications found.</div>
            ) : (
              <div className="space-y-6 flex-1">
                {filteredNotifications.map(n => (
                  <div
                    key={n._id}
                    onClick={() => !n.read && markSingleAsRead(n._id)}
                    className={`flex gap-4 items-start p-2 rounded-xl transition cursor-pointer ${!n.read ? 'bg-emerald-50/30' : ''}`}
                  >
                    {getIcon(n.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-xs font-extrabold ${!n.read ? 'text-gray-900 font-black' : 'text-gray-600'}`}>{n.title}</h4>
                        <span className="text-[10px] text-gray-400 font-medium">{formatTime(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">{n.desc}</p>
                      {n.badges && n.badges.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {n.badges.map((b, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.color}`}>
                              {b.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
