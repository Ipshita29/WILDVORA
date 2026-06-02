import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';

import { theme } from './src/theme';
import { initialListings, initialBookings } from './src/data/mockData';

import DashboardHome     from './src/screens/DashboardHome';
import MyListings        from './src/screens/MyListings';
import CreateEditListing from './src/screens/CreateEditListing';
import BookingsManager   from './src/screens/BookingsManager';
import Payouts           from './src/screens/Payouts';
import ReviewsRatings    from './src/screens/ReviewsRatings';

const TABS = [
  { id: 'home',     label: 'Home',     icon: '⊞' },
  { id: 'listings', label: 'Listings', icon: '📍' },
  { id: 'bookings', label: 'Bookings', icon: '📋' },
  { id: 'payouts',  label: 'Payouts',  icon: '💰' },
  { id: 'reviews',  label: 'Reviews',  icon: '⭐' },
];

export default function App() {
  const [activeTab, setActiveTab]   = useState('home');
  const [listings, setListings]     = useState(initialListings);
  const [bookings, setBookings]     = useState(initialBookings);
  const [editListing, setEditListing] = useState(null);

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
          {activeTab === 'create' && (
            <TouchableOpacity
              onPress={() => setActiveTab('listings')}
              style={styles.backBtn}
            >
              <Text style={{ color: theme.accent, fontSize: 16 }}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.appName}>Wildvora</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
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