import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  ImageBackground, useWindowDimensions, SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import Alert from '../utils/alert';

export default function LoginScreen({ navigation, onToggleScreen }) {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const Logo = ({ light }) => (
    <View style={styles.logoContainer}>
      <View style={styles.logoMark}>
        <View style={[styles.triangle, styles.leftPeak, light && styles.triangleLight]} />
        <View style={[styles.triangle, styles.rightPeak, light && styles.triangleLight]} />
      </View>
      <Text style={[styles.logoText, light ? styles.textWhite : styles.textPrimary]}>
        Wildvora
      </Text>
    </View>
  );

  const renderForm = () => (
    <View style={styles.card}>
      <View style={styles.logoWrapper}>
        <Logo light={false} />
      </View>

      <Text style={styles.cardTitle}>Welcome Back</Text>
      <Text style={styles.cardSubtitle}>Sign in to manage your operator portal.</Text>

      {/* Email Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          placeholderTextColor="#a0a8a3"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#a0a8a3"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#6f7a73" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit CTA */}
      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.btnContent}>
            <Text style={styles.btnText}>Sign In</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google Login */}
      <TouchableOpacity style={styles.btnGoogle} activeOpacity={0.8}>
        <View style={styles.gLogoContainer}>
          <Text style={styles.gLogoText}>G</Text>
        </View>
        <Text style={styles.googleBtnText}>Sign In with Google</Text>
      </TouchableOpacity>

      {/* Footer Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={onToggleScreen}>
          <Text style={styles.footerLink}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLargeScreen) {
    return (
      <View style={styles.desktopContainer}>
        {/* Left column: Image banner */}
        <ImageBackground
          source={require('../../assets/register-hero.png')}
          style={styles.leftBanner}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(21, 107, 78, 0.4)', 'rgba(10, 102, 135, 0.85)']}
            style={styles.gradientOverlay}
          >
            <View style={styles.bannerContent}>
              <Logo light={true} />
              <View style={styles.bannerTextSection}>
                <Text style={styles.headline}>
                  List your experiences and reach adventurers worldwide.
                </Text>
                <Text style={styles.tagline}>
                  Join the premier community for modern explorers. Share the untamed beauty of the world and grow your adventure business.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Right column: Form Container */}
        <View style={styles.rightFormArea}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {renderForm()}
          </ScrollView>
        </View>
      </View>
    );
  }

  // Mobile / Small Screen view
  return (
    <SafeAreaView style={styles.mobileContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {renderForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Desktop Split Screen Layout
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f6f3ed',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  leftBanner: {
    width: '50%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    padding: 48,
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bannerTextSection: {
    marginBottom: 48,
  },
  headline: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 52,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  rightFormArea: {
    width: '50%',
    backgroundColor: '#f6f3ed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Mobile Layout
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f6f3ed',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },

  // Card & Logo Style
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    padding: 32,
    shadowColor: '#156b4e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 24,
    height: 18,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  leftPeak: {
    left: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 12,
    borderBottomColor: '#C4A482', // tan
  },
  rightPeak: {
    left: 6,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 16,
    borderBottomColor: '#156b4e', // primary green
    zIndex: 1,
  },
  triangleLight: {
    borderBottomColor: '#ffffff',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textWhite: {
    color: '#ffffff',
  },
  textPrimary: {
    color: '#156b4e',
  },

  // Card Content
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#181d1a',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6f7a73',
    textAlign: 'center',
    marginBottom: 28,
  },

  // Form styles
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#181d1a',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e2dc',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#181d1a',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e2dc',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: 46,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#181d1a',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },

  // Buttons
  btnPrimary: {
    backgroundColor: '#156b4e',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#156b4e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e2dc',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#a0a8a3',
    fontSize: 12,
    fontWeight: '700',
  },

  // Google button
  btnGoogle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e2dc',
    borderRadius: 24,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#ffffff',
  },
  gLogoContainer: {
    width: 20,
    height: 20,
    backgroundColor: '#EA4335',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gLogoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#181d1a',
  },

  // Footer links
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    color: '#6f7a73',
    fontSize: 14,
  },
  footerLink: {
    color: '#156b4e',
    fontWeight: '700',
    fontSize: 14,
  },
});
