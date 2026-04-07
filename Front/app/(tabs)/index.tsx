import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, Platform } from 'react-native';
import StapleLogo from '@/components/StapleLogo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';

import { getToken, getUserDetails } from '@/services/authStorage';

const Index = () => {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Already in PWA / standalone mode? Don't show
    const standalone = (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) return;

    // Show the custom install banner on all web (mobile + tablet)
    setShowInstallBanner(true);

    // If the native install prompt fires (Chrome Android), hide our banner
    const hide = () => setShowInstallBanner(false);
    window.addEventListener('beforeinstallprompt', hide);
    return () => window.removeEventListener('beforeinstallprompt', hide);
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await getToken();
      const userDetails = await getUserDetails();

      if (token && userDetails && userDetails.role) {
        console.log('Token still valid, navigating to home');
        const route = userDetails.role === 'coach' ? '/coachs/home' : '/clients/home';
        navigation.push(route);
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
      {showInstallBanner && !installDismissed && (
        <View style={styles.installBanner}>
          <View style={styles.installBannerContent}>
            <Ionicons name="download-outline" size={20} color="#3498DB" />
            <View style={{ flex: 1 }}>
              <Text style={styles.installBannerTitle}>Install Staple App</Text>
              <Text style={styles.installBannerText}>
                Tap <Ionicons name="share-outline" size={12} color="#3498DB" /> then "Add to Home Screen"
              </Text>
            </View>
            <TouchableOpacity onPress={() => setInstallDismissed(true)} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color="#8A8D91" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.logoContainer}>
        <StapleLogo fontSize={36} />
        <Text style={{ color: '#888', fontSize: 9, letterSpacing: 2, marginTop: 4 }}>TRAIN SMART, LIVE STRONG</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Welcome to your fitness journey</Text>
        <Text style={styles.descriptionText}>
          Track your nutrition, follow personalized training plans, and reach your fitness goals with STAPLE
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Link href="/login" asChild>
          <Pressable style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </Pressable>
        </Link>

        <Link href="/signup" asChild>
          <Pressable style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.footerText}>Your personal fitness & nutrition app</Text>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2B',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  installBanner: {
    backgroundColor: '#1E2C3D',
    marginHorizontal: -20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 152, 219, 0.3)',
  },
  installBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  installBannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  installBannerText: {
    color: '#8A8D91',
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#3498DB',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
    // @ts-ignore — cursor is valid on web
    cursor: 'pointer',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    // @ts-ignore
    cursor: 'pointer',
  },
  signupButtonText: {
    color: '#2A4562',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  }
});

export default Index;
