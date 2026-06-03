import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F0EB]">
        <div className="text-lg font-medium text-gray-600">Loading admin console...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <polygon points="14,2 26,22 2,22" fill="#1A5F45" opacity="0.9"/>
            <polygon points="14,6 22,20 6,20" fill="#C4A482" />
          </svg>
          <span className="text-xl font-bold tracking-wide text-gray-900">Wildvora</span>
          <span className="bg-[#1A5F45]/10 text-[#1A5F45] text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">Admin Control</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-full border border-red-200 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to the Administration Console</h1>
          <p className="text-gray-500 mb-8 max-w-xl">
            You have successfully authenticated as a Wildvora Administrator. From this dashboard, you can approve experiences, override payout settlements, monitor operators, and manage disputes.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-emerald-50/55 border border-emerald-100 rounded-2xl p-6">
              <div className="text-sm font-medium text-emerald-800 uppercase tracking-wider mb-2">System Status</div>
              <div className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Active &amp; Online
              </div>
            </div>
            <div className="bg-[#F5F0EB]/60 border border-gray-100 rounded-2xl p-6">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Your Role</div>
              <div className="text-2xl font-bold text-gray-900 capitalize">{user?.role}</div>
            </div>
            <div className="bg-[#F5F0EB]/60 border border-gray-100 rounded-2xl p-6">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">API Connection</div>
              <div className="text-2xl font-bold text-gray-900">Connected</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route path="/"                element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}