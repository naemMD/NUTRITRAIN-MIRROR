import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import StapleLogo from '@/components/StapleLogo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

import { getToken, getUserDetails } from '@/services/authStorage';

const Index = () => {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  const { canShow, canNativeInstall, isIOS, isAndroidManual, promptInstall, state } = useInstallPrompt();
  const [installDismissed, setInstallDismissed] = useState(false);

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

  const showInstall = canShow && state !== 'installed' && !installDismissed;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

      {showInstall && (
        <View style={styles.installCard}>
          <View style={styles.installHeader}>
            <Ionicons name="download-outline" size={22} color="#3498DB" />
            <Text style={styles.installTitle}>Install Staple App</Text>
            <Pressable onPress={() => setInstallDismissed(true)} hitSlop={8}>
              <Ionicons name="close" size={18} color="#8A8D91" />
            </Pressable>
          </View>
          {canNativeInstall ? (
            <Pressable style={styles.installButton} onPress={promptInstall}>
              <Text style={styles.installButtonText}>Add to Home Screen</Text>
            </Pressable>
          ) : isIOS ? (
            <Text style={styles.installHint}>
              Tap the Share button (bottom bar) then "Add to Home Screen"
            </Text>
          ) : isAndroidManual ? (
            <Text style={styles.installHint}>
              Tap the menu button then "Add to Home Screen"
            </Text>
          ) : null}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.loginButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.push('/login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.signupButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.push('/signup')}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </Pressable>
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
  installCard: {
    backgroundColor: '#2A4562',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.25)',
  },
  installHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  installTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  installHint: {
    color: '#8A8D91',
    fontSize: 13,
    lineHeight: 20,
  },
  installButton: {
    backgroundColor: '#3498DB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  installButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
  },
  signupButtonText: {
    color: '#2A4562',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  }
});

export default Index;
