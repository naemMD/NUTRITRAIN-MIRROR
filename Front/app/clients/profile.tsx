import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import Constants from 'expo-constants';
import { getUserDetails } from '@/services/authStorage';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  const loadData = async () => {
    try {
        const session = await getUserDetails();
        if (session?.id) {
             // On requête l'API pour être sûr d'avoir le champ unique_code (s'il vient d'être ajouté en BDD)
            const response = await axios.get(`${API_URL}/users/me/${session.id}`);
            setUser(response.data);
        }
    } catch (e) {
        console.log(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = () => {
      if (user?.unique_code) {
          Clipboard.setString(user.unique_code);
          Alert.alert("Copied!", "Your code has been copied to clipboard.");
      }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <Text style={styles.screenTitle}>Your profile</Text>
      
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'PATH' }}
            style={styles.profileImage}
          />
          <Text style={styles.editPhotoText}>Edit profile picture</Text>
        </View>
        
        <View style={styles.profileDetails}>
          <Text style={styles.userName}>{user?.firstname} {user?.lastname}</Text>
          <Text style={styles.userDetail}>Gender : {user?.gender}</Text>
          <Text style={styles.userDetail}>Age : {user?.age}</Text>
          
          {/* SECTION CODE UNIQUE */}
          {user?.unique_code && (
              <TouchableOpacity style={styles.codeContainer} onPress={copyToClipboard}>
                  <Text style={styles.codeLabel}>My Code:</Text>
                  <Text style={styles.codeValue}>{user.unique_code}</Text>
                  <Ionicons name="copy-outline" size={16} color="#3498DB" style={{marginLeft: 5}}/>
              </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.trainingTitle}>Training plans</Text>
      
      <View style={styles.trainingCalendar}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.dayText}>Friday</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.exercisesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.exerciseCard}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>Side lateral raises</Text>
            <Text style={styles.exerciseDetail}>3 x 10 reps</Text>
            <Text style={styles.exerciseDetail}>Weight : 18kg</Text>
          </View>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
        {/* Autres exercices... */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2B',
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#CCCCCC',
    marginBottom: 5,
  },
  editPhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userDetail: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 2,
  },
  // NOUVEAUX STYLES CODE
  codeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2A4562',
      padding: 8,
      borderRadius: 8,
      marginTop: 5,
      alignSelf: 'flex-start'
  },
  codeLabel: {
      color: '#aaa',
      fontSize: 12,
      marginRight: 5
  },
  codeValue: {
      color: '#3498DB',
      fontWeight: 'bold',
      fontSize: 16
  },
  editButton: {
    backgroundColor: '#3498DB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  trainingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  trainingCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A4562',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exercisesContainer: {
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: '#2A4562',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseDetail: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: '#3498DB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;