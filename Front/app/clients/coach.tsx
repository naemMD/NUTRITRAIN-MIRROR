import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { getUserDetails, getToken } from '@/services/authStorage';
import * as Clipboard from 'expo-clipboard';

const CoachScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  const [user, setUser] = useState<any>(null);
  const [myCoach, setMyCoach] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const session = await getUserDetails();
      const token = await getToken();
      
      if (session?.id && token) {
         const userRes = await axios.get(`${API_URL}/users/me/${session.id}`);
         const userData = userRes.data;
         setUser(userData);

         if (userData.coach_id) {
             try {
                 const coachRes = await axios.get(`${API_URL}/users/me/${userData.coach_id}`);
                 setMyCoach(coachRes.data);
             } catch (e) {
                 console.error("Could not fetch coach details", e);
             }
         } else {
             setMyCoach(null);
             try {
                 const invRes = await axios.get(`${API_URL}/clients/me/invitations`, {
                     headers: { Authorization: `Bearer ${token}` }
                 });
                 setInvitations(invRes.data.invitations || []);
             } catch (e) {
                 console.error("Could not fetch invitations", e);
             }
         }
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleCopyCode = async () => {
      if (user?.unique_code) {
          await Clipboard.setStringAsync(user.unique_code);
          Alert.alert("Copied!", "Your unique code has been copied to clipboard.");
      }
  };

  const handleChangeCoach = () => {
      Alert.alert(
          "Leave Coach",
          "Do you really want to leave your coach?",
          [
              { text: "Cancel", style: "cancel" },
              {
                  text: "Leave",
                  style: "destructive",
                  onPress: async () => {
                      try {
                          const token = await getToken();

                          if (!token) {
                              Alert.alert("Authentication Error", "Session expired. Please log in again.");
                              return;
                          }

                          await axios.delete(`${API_URL}/users/me/coach`, {
                              headers: {
                                  Authorization: `Bearer ${token}`
                              }
                          });
                          
                          Alert.alert("Success", "You have left your coach.");
                          setMyCoach(null); 
                          loadData(); 
                          
                      } catch (error: any) {
                          console.error("Error leaving coach:", error);
                          const msg = error.response?.data?.detail || "Failed to leave coach. Please try again.";
                          Alert.alert("Error", msg);
                      }
                  }
              }
          ]
      );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {loading ? (
        <ActivityIndicator size="large" color="#3498DB" style={{marginTop: 50}} />
      ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {myCoach ? (
                <>
                    {/* --- VUE AVEC COACH ACTIF --- */}
                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Your Coach</Text>
                    <View style={styles.coachCardContainer}>
                        <View style={styles.coachCard}>
                            <View style={styles.coachImagePlaceholder}>
                                <Text style={styles.avatarText}>{myCoach.firstname ? myCoach.firstname[0] : 'C'}</Text>
                            </View>
                            <View style={{flex: 1, marginLeft: 15}}>
                                <Text style={styles.coachName}>{myCoach.firstname} {myCoach.lastname}</Text>
                                <Text style={{color: '#aaa'}}>{myCoach.email}</Text>
                                <TouchableOpacity style={styles.contactButton}>
                                    <Text style={styles.contactButtonText}>Contact</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                    <TouchableOpacity style={styles.changeCoachButton} onPress={handleChangeCoach}>
                        <Text style={styles.changeCoachText}>Unassign / Change coach</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.aiCoachButton}>
                        <Text style={styles.aiCoachText}>Talk to the AI coach</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <View style={styles.noCoachContainer}>
                    
                    {/* --- CARROUSEL HORIZONTAL DES INVITATIONS --- */}
                    {invitations.length > 0 && (
                        <View style={styles.invitationsSection}>
                            <Text style={styles.invitationsHeader}>Pending Requests ({invitations.length})</Text>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20, paddingBottom: 10 }}
                            >
                                {invitations.map((inv) => (
                                    <TouchableOpacity 
                                        key={inv.id} 
                                        style={styles.invitationCardHorizontal}
                                        onPress={() => router.push({
                                            pathname: "/clients/coach-public-profile",
                                            params: { coachId: inv.coach_id, invitationId: inv.id }
                                        })}
                                    >
                                        <View style={styles.miniAvatar}>
                                            <Text style={styles.miniAvatarText}>{inv.coach_firstname?.[0] || '?'}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.invitationText} numberOfLines={1}>
                                                <Text style={{ fontWeight: 'bold' }}>{inv.coach_firstname} {inv.coach_lastname}</Text>
                                            </Text>
                                            <Text style={styles.coachCityText}>
                                                <Ionicons name="location" size={12} color="#8A8D91" /> {inv.coach_city || 'Remote'}
                                            </Text>
                                            <Text style={styles.viewProfileLink}>Tap to view profile</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#3498DB" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* DÉMARCATION VISUELLE (visible uniquement s'il y a des invitations) */}
                    {invitations.length > 0 && <View style={styles.separator} />}

                    {/* --- VUE STANDARD SANS COACH (CODE UNIQUE) --- */}
                    <Ionicons name="people-circle-outline" size={80} color="#3498DB" style={{marginBottom: 20}} />
                    
                    <Text style={styles.noCoachTitle}>You don't have a coach yet</Text>
                    <Text style={styles.noCoachText}>
                        To get started with a professional coach, please share your unique code with them.
                    </Text>

                    <View style={styles.codeCard}>
                        <Text style={styles.codeLabel}>YOUR UNIQUE CODE</Text>
                        <Text style={styles.codeValue}>{user?.unique_code || "Loading..."}</Text>
                    </View>

                    <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                        <Ionicons name="copy-outline" size={20} color="white" style={{marginRight: 10}}/>
                        <Text style={styles.copyButtonText}>Copy to clipboard</Text>
                    </TouchableOpacity>

                    <View style={styles.infoBox}>
                         <Ionicons name="information-circle-outline" size={24} color="#aaa" />
                         <Text style={styles.infoText}>
                             Once your coach adds this code in their app, you will automatically be linked to them.
                         </Text>
                    </View>
                </View>
            )}
          </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2B',
  },
  sectionTitle: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      paddingHorizontal: 16
  },
  coachCardContainer: {
    marginBottom: 20,
    paddingHorizontal: 16
  },
  coachCard: {
    backgroundColor: '#2A4562',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  },
  coachName: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 5
  },
  contactButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  contactButtonText: {
    color: '#2A4562',
    fontSize: 14,
    fontWeight: 'bold',
  },
  changeCoachButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 20,
    alignItems: 'center',
    marginHorizontal: 16
  },
  changeCoachText: {
    fontWeight: 'bold',
    color: '#2A4562',
    fontSize: 16,
  },
  aiCoachButton: {
    backgroundColor: '#3498DB',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 20,
    alignItems: 'center',
    marginHorizontal: 16
  },
  aiCoachText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  noCoachContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
  },
  noCoachTitle: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      paddingHorizontal: 20
  },
  noCoachText: {
      color: '#aaa',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 30,
      paddingHorizontal: 20
  },
  codeCard: {
      backgroundColor: '#2A4562',
      width: '90%',
      padding: 20,
      borderRadius: 15,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#3498DB',
      marginBottom: 20
  },
  codeLabel: {
      color: '#aaa',
      fontSize: 12,
      letterSpacing: 1,
      marginBottom: 5
  },
  codeValue: {
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
      letterSpacing: 2
  },
  copyButton: {
      flexDirection: 'row',
      backgroundColor: '#3498DB',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 30
  },
  copyButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16
  },
  infoBox: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 20,
      width: '90%'
  },
  infoText: {
      color: '#888',
      marginLeft: 10,
      flex: 1,
      fontSize: 14,
      lineHeight: 20
  },
  invitationsSection: {
      width: '100%',
      marginBottom: 30,
      paddingLeft: 16, 
  },
  invitationsHeader: {
      color: '#8A8D91',
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  invitationCardHorizontal: {
      backgroundColor: '#232D3F',
      borderRadius: 16,
      padding: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#f1c40f',
      flexDirection: 'row',
      alignItems: 'center',
      width: 280, 
      marginRight: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
  },
  miniAvatar: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      backgroundColor: '#3498DB',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
  },
  miniAvatarText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 20,
  },
  invitationText: {
      color: 'white',
      fontSize: 14,
  },
  coachCityText: {
      color: '#8A8D91',
      fontSize: 12,
      marginTop: 2,
  },
  viewProfileLink: {
      color: '#f1c40f',
      fontSize: 12,
      marginTop: 4,
      fontWeight: 'bold',
  },
  separator: {
      height: 1,
      backgroundColor: '#2A4562',
      width: '85%',
      alignSelf: 'center',
      marginBottom: 30,
  }
});

export default CoachScreen;