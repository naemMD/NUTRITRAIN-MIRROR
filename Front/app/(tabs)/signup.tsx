import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

import { saveSession } from '@/services/authStorage';

const SignupPage = () => {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userGender, setUserGender] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  
  const [city, setCity] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('Perte de poids');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorField, setErrorField] = useState('');
  const [loading, setLoading] = useState(false);

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const ageRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';
  
  const validateForm = () => {
    setErrorField('');
    
    if (!firstName || firstName.trim() === '') {
      setErrorField('firstname');
      firstNameRef.current?.focus();
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Please enter your first name' });
      return false;
    }

    if (!lastName || lastName.trim() === '') {
      setErrorField('lastname');
      lastNameRef.current?.focus();
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Please enter your last name' });
      return false;
    }

    const ageNumber = Number(age);
    if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 100 || age === '') {
      setErrorField('age');
      ageRef.current?.focus();
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Please enter a valid age' });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorField('email');
      emailRef.current?.focus();
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Please enter a valid email address' });
      return false;
    }
    
    if (!password || password.length < 6) {
      setErrorField('password');
      passwordRef.current?.focus();
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Password must be at least 6 characters long' });
      return false;
    }

    if (password.length > 72) {
      setErrorField('password');
      passwordRef.current?.focus();
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Password cannot exceed 72 characters' });
      return false;
    }
    
    if (password !== confirmPassword) {
      setErrorField('confirmPassword');
      confirmPasswordRef.current?.focus();
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Passwords do not match' });
      return false;
    }
    
    if (!userType) {
      setErrorField('userType');
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Please select if you are a client or coach' });
      return false;
    }
    
    return true;
  };
  
  const handleSignup = async () => {
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      const userData = {
        email: email,
        firstname: firstName,
        lastname: lastName,
        gender: userGender,
        age: Number(age),
        password: password,
        role: userType,
      };

      if (userType === 'coach') {
        userData.city = city;
      } else if (userType === 'client') {
        userData.weight = parseFloat(weight) || null;
        userData.height = parseFloat(height) || null;
        userData.goal = goal;
      }

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        setErrorField('email');
        emailRef.current?.focus();
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: data.detail || 'Please check your information.',
        });
        setLoading(false);
        return; 
      }
      
      const { access_token } = data;
      await saveSession(access_token);
      
      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Welcome to NutriTrain.',
      });

      let route = userType === 'coach' ? '/coachs/home' : '/clients/home';
      navigation.push(`${route}`);
      
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: err.message || 'Unable to connect to the server.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const testServerConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();
      Toast.show({ type: 'info', text1: 'Server OK', text2: JSON.stringify(data) });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Server Error', text2: err.message });
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.back()}>
            <Ionicons name="arrow-back" size={28} color="#3498DB" />
          </TouchableOpacity>
          <Text style={styles.appName}>
            <Text style={styles.appNameBlue}>NUTRI</Text>
            <Text style={styles.appNameWhite}>TRAIN</Text>
          </Text>
          <TouchableOpacity style={styles.testButton} onPress={testServerConnection}>
            <Ionicons name="server-outline" size={24} color="#3498DB" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Enter your details to get started</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Firstname</Text>
          <TextInput 
            ref={firstNameRef}
            style={[styles.input, errorField === 'firstname' && styles.inputError]} 
            placeholder="Enter your firstname" 
            placeholderTextColor="#8A8D91" 
            value={firstName} 
            onChangeText={(text) => { setFirstName(text); setErrorField(''); }} 
          />

          <Text style={styles.inputLabel}>Lastname</Text>
          <TextInput 
            ref={lastNameRef}
            style={[styles.input, errorField === 'lastname' && styles.inputError]} 
            placeholder="Enter your lastname" 
            placeholderTextColor="#8A8D91" 
            value={lastName} 
            onChangeText={(text) => { setLastName(text); setErrorField(''); }} 
          />

          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.userGenderContainer}>
            <TouchableOpacity style={[styles.userGenderButton, userGender === 'male' && styles.selectedUserGender]} onPress={() => setUserGender('male')}>
                <Text style={[styles.userGenderText, userGender === 'male' && styles.selectedUserGenderText]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.userGenderButton, userGender === 'female' && styles.selectedUserGender]} onPress={() => setUserGender('female')}>
                <Text style={[styles.userGenderText, userGender === 'female' && styles.selectedUserGenderText]}>Female</Text>
            </TouchableOpacity>
          </View> 

          <Text style={styles.inputLabel}>Age</Text>
          <TextInput 
            ref={ageRef}
            style={[styles.input, errorField === 'age' && styles.inputError]} 
            placeholder="Enter your age" 
            placeholderTextColor="#8A8D91" 
            keyboardType="numeric" 
            value={age} 
            onChangeText={(text) => { setAge(text); setErrorField(''); }} 
          />
          
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput 
            ref={emailRef}
            style={[styles.input, errorField === 'email' && styles.inputError]} 
            placeholder="Enter your email" 
            placeholderTextColor="#8A8D91" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            value={email} 
            onChangeText={(text) => { setEmail(text); setErrorField(''); }} 
          />
          
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.passwordContainer, errorField === 'password' && styles.inputError]}>
            <TextInput 
              ref={passwordRef}
              style={styles.passwordInput} 
              placeholder="Create a password" 
              placeholderTextColor="#8A8D91" 
              secureTextEntry={!showPassword} 
              value={password} 
              onChangeText={(text) => { setPassword(text); setErrorField(''); }} 
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={[styles.passwordContainer, errorField === 'confirmPassword' && styles.inputError]}>
            <TextInput 
              ref={confirmPasswordRef}
              style={styles.passwordInput} 
              placeholder="Confirm your password" 
              placeholderTextColor="#8A8D91" 
              secureTextEntry={!showConfirmPassword} 
              value={confirmPassword} 
              onChangeText={(text) => { setConfirmPassword(text); setErrorField(''); }} 
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>I am a:</Text>
          <View style={[styles.userTypeContainer, errorField === 'userType' && { borderWidth: 1, borderColor: '#FF6B6B', borderRadius: 10 }]}>
            <TouchableOpacity style={[styles.userTypeButton, userType === 'client' && styles.selectedUserType]} onPress={() => { setUserType('client'); setErrorField(''); }}>
              <Text style={[styles.userTypeText, userType === 'client' && styles.selectedUserTypeText]}>Client</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.userTypeButton, userType === 'coach' && styles.selectedUserType]} onPress={() => { setUserType('coach'); setErrorField(''); }}>
              <Text style={[styles.userTypeText, userType === 'coach' && styles.selectedUserTypeText]}>Coach</Text>
            </TouchableOpacity>
          </View>

          {userType === 'coach' && (
            <View style={styles.dynamicSection}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Where do you coach? (e.g. Marseille)" 
                placeholderTextColor="#8A8D91" 
                value={city} 
                onChangeText={setCity} 
              />
            </View>
          )}

          {userType === 'client' && (
            <View style={styles.dynamicSection}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flex: 0.48}}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput style={styles.input} placeholder="e.g. 70" placeholderTextColor="#8A8D91" keyboardType="numeric" value={weight} onChangeText={setWeight} />
                </View>
                <View style={{flex: 0.48}}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput style={styles.input} placeholder="e.g. 175" placeholderTextColor="#8A8D91" keyboardType="numeric" value={height} onChangeText={setHeight} />
                </View>
              </View>

              <Text style={styles.inputLabel}>Main Goal</Text>
              <View style={styles.goalContainer}>
                {['Perte de poids', 'Maintien', 'Prise de masse'].map((g) => (
                  <TouchableOpacity 
                    key={g} 
                    style={[styles.goalButton, goal === g && styles.selectedGoalButton]} 
                    onPress={() => setGoal(g)}
                  >
                    <Text style={[styles.goalText, goal === g && styles.selectedGoalText]}>
                      {g === 'Perte de poids' ? 'Weight Loss' : g === 'Maintien' ? 'Maintain' : 'Muscle Gain'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </View>
        
        <TouchableOpacity style={[styles.signupButton, loading && styles.signupButtonDisabled]} onPress={handleSignup} disabled={loading}>
          <Text style={styles.signupButtonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.push('/(tabs)/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.termsText}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B' },
  scrollContainer: { flexGrow: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, justifyContent: 'space-between' },
  testButton: { padding: 5 },
  appName: { fontSize: 24, fontWeight: 'bold' },
  appNameBlue: { color: '#3498DB' },
  appNameWhite: { color: '#FFFFFF' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#FFFFFF', marginBottom: 30 },
  formContainer: { marginBottom: 20 },
  inputLabel: { color: '#FFFFFF', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: '#2A4562', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, color: '#FFFFFF', fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: '#FF6B6B', borderWidth: 1 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A4562', borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: 'transparent' },
  passwordInput: { flex: 1, paddingHorizontal: 15, paddingVertical: 12, color: '#FFFFFF', fontSize: 16 },
  eyeIcon: { paddingRight: 15 },
  userTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  userTypeButton: { backgroundColor: '#2A4562', borderRadius: 10, paddingVertical: 12, width: '48%', alignItems: 'center' },
  selectedUserType: { backgroundColor: '#3498DB' },
  userTypeText: { color: '#FFFFFF', fontSize: 16 },
  selectedUserTypeText: { fontWeight: 'bold' },
  userGenderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  userGenderButton: { backgroundColor: '#2A4562', borderRadius: 10, paddingVertical: 12, width: '48%', alignItems: 'center' },
  selectedUserGender: { backgroundColor: '#3498DB' },
  userGenderText: { color: '#FFFFFF', fontSize: 16 },
  selectedUserGenderText: { fontWeight: 'bold' },
  dynamicSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2A4562' },
  goalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  goalButton: { backgroundColor: '#2A4562', borderRadius: 10, paddingVertical: 12, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  selectedGoalButton: { backgroundColor: '#3498DB' },
  goalText: { color: '#FFFFFF', fontSize: 11, textAlign: 'center' },
  selectedGoalText: { fontWeight: 'bold' },
  signupButton: { backgroundColor: '#3498DB', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  signupButtonDisabled: { backgroundColor: '#2A4562', opacity: 0.7 },
  signupButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  loginText: { color: '#FFFFFF', fontSize: 16 },
  loginLink: { color: '#3498DB', fontSize: 16, fontWeight: 'bold' },
  termsText: { color: '#8A8D91', fontSize: 14, textAlign: 'center', marginBottom: 20 },
});

export default SignupPage;