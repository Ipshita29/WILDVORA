import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, ActivityIndicator } from 'react-native';

import { theme } from './src/theme';
import { initialListings, initialBookings } from './src/data/mockData';

import DashboardHome     from './src/screens/DashboardHome';
import MyListings        from './src/screens/MyListings';
import CreateEditListing from './src/screens/CreateEditListing';
import BookingsManager   from './src/screens/BookingsManager';
import Payouts           from './src/screens/Payouts';
import ReviewsRatings    from './src/screens/ReviewsRatings';
import RegisterScreen    from './src/screens/RegisterScreen';
import LoginScreen       from './src/screens/LoginScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';

const TABS = [
  { id: 'home',     label: 'Home',     icon: '⊞' },
  { id: 'listings', label: 'Listings', icon: '📍' },
  { id: 'bookings', label: 'Bookings', icon: '📋' },
  { id: 'payouts',  label: 'Payouts',  icon: '💰' },
  { id: 'reviews',  label: 'Reviews',  icon: '⭐' },
];

function MainApp() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab]   = useState('home');
  const [listings, setListings]     = useState(initialListings);
  const [bookings, setBookings]     = useState(initialBookings);
  const [editListing, setEditListing] = useState(null);
  
  // Toggle between register and login screens
  const [authScreen, setAuthScreen] = useState('register'); // 'register' or 'login'

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#156b4e" />
      </View>
    );
  }

  // Gate the app behind authentication
  if (!user) {
    if (authScreen === 'register') {
      return <RegisterScreen onToggleScreen={() => setAuthScreen('login')} />;
    } else {
      return <LoginScreen onToggleScreen={() => setAuthScreen('register')} />;
    }
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome bookings={bookings} setActiveTab={setActiveTab} />;
      case 'listings':
        return (
          <MyListings
            listings={listings}
            setListings={setListings}
            setEditListing={setEditListing}
            setActiveTab={setActiveTab}
          />
        );
      case 'create':
        return (
          <CreateEditListing
            editListing={editListing}
            setListings={setListings}
            setActiveTab={setActiveTab}
          />
        );
      case 'bookings':
        return <BookingsManager bookings={bookings} setBookings={setBookings} />;
      case 'payouts':
        return <Payouts bookings={bookings} />;
      case 'reviews':
        return <ReviewsRatings />;
      default:
        return <DashboardHome bookings={bookings} setActiveTab={setActiveTab} />;
    }
  };

  const showTabs = activeTab !== 'create';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />

      {/* Safe area top padding */}
      <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44 }}>
        {/* Screen Title Bar */}
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {activeTab === 'create' && (
              <TouchableOpacity
                onPress={() => setActiveTab('listings')}
                style={styles.backBtn}
              >
                <Text style={{ color: theme.accent, fontSize: 16 }}>← Back</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.appName}>Wildvora Operator</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Screen */}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Bottom Tab Bar */}
      {showTabs && (
        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f3ed',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  backBtn: {
    marginRight: 12,
  },
  appName: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: theme.danger + '22',
  },
  logoutText: {
    color: theme.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    color: theme.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: theme.accent,
    fontWeight: '700',
  },
});