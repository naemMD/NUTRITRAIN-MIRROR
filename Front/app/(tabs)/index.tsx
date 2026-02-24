import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { getToken, getUserDetails } from '@/services/authStorage';

const Index = () => {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.logoContainer}>
        <Text style={styles.appName}>
          <Text style={styles.appNameBlue}>NUTRI</Text>
          <Text style={styles.appNameWhite}>TRAIN</Text>
        </Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Welcome to your fitness journey</Text>
        <Text style={styles.descriptionText}>
          Track your nutrition, follow personalized training plans, and reach your fitness goals with NUTRITRAIN
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.push('/login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.signupButton}
          onPress={() => navigation.push('/signup')}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerText}>Your personal nutrition and training app</Text>
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
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  appNameBlue: {
    color: '#3498DB',
  },
  appNameWhite: {
    color: '#FFFFFF',
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
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  }
});

export default Index;