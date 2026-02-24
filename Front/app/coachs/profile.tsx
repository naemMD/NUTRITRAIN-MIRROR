import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';

import { getUserDetails, clearSession } from '@/services/authStorage';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  // États pour les données et le chargement
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Récupération des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer l'ID stocké dans le stockage sécurisé
        const session = await getUserDetails();
        
        if (session?.id) {
          // Appel API pour avoir les détails frais (created_at, age, gender...)
          const response = await axios.get(`${API_URL}/users/me/${session.id}`);
          setUser(response.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        Alert.alert("Error", "Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 2. Logique de Déconnexion (Conservée)
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await clearSession();
              router.replace('/(tabs)/login'); 
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Error", "Could not log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <Text style={styles.screenTitle}>Your profile</Text>
      
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {/* Gestion de l'avatar : Placeholder si pas d'image, ou première lettre */}
          <View style={[styles.profileImage, { justifyContent: 'center', alignItems: 'center' }]}>
             <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#2A4562' }}>
                {user?.firstname ? user.firstname[0] : '?'}
             </Text>
          </View>
          <Text style={styles.editPhotoText}>Edit profile picture</Text>
        </View>
        
        <View style={styles.profileDetails}>
          {/* Données dynamiques */}
          <Text style={styles.userName}>{user?.firstname} {user?.lastname}</Text>
          <Text style={styles.userDetail}>Sex : {user?.gender}</Text>
          <Text style={styles.userDetail}>Age : {user?.age} years</Text>
          <Text style={styles.userDetail}>Date of subscription :</Text>
          <Text style={styles.userDetail}>
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
          </Text>
          
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
        
        <View style={styles.exerciseCard}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>Military press smith</Text>
            <Text style={styles.exerciseDetail}>3 x 10 reps</Text>
            <Text style={styles.exerciseDetail}>Weight : 30kg</Text>
          </View>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.exerciseCard}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>Incline Bench smith</Text>
            <Text style={styles.exerciseDetail}>3 x 10 reps</Text>
            <Text style={styles.exerciseDetail}>Weight : 40kg</Text>
          </View>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>

        {/* Espace vide pour le scroll */}
        <View style={{height: 20}} />
      </ScrollView>

      {/* BOUTON LOGOUT (Conservé) */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B6B" style={{marginRight: 10}} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

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
  // Styles Logout
  footerContainer: {
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: '#2A4562',
      marginTop: 10
  },
  logoutButton: {
      flexDirection: 'row',
      backgroundColor: 'rgba(231, 76, 60, 0.15)',
      borderRadius: 10,
      paddingVertical: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e74c3c'
  },
  logoutButtonText: {
      color: '#e74c3c',
      fontSize: 16,
      fontWeight: 'bold',
  }
});

export default ProfileScreen;