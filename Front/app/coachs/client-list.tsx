import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { getUserDetails } from '@/services/authStorage';

const { width } = Dimensions.get('window');

const CoachListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clientCode, setClientCode] = useState('#'); 
  const [adding, setAdding] = useState(false);

  const fetchClients = async (id = userId) => {
    if (!id) return;
    try {
        const response = await axios.get(`${API_URL}/coaches/${id}/clients`);
        setClients(response.data);
    } catch (error) {
        console.error("Erreur fetching clients:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getUserDetails();
        if (user?.id) {
            setUserId(user.id);
            fetchClients(user.id);
        }
      } catch (error) {
         setLoading(false);
      }
    };
    init();
  }, []);

  const handleCodeChange = (text: string) => {
      if (text === '') {
          setClientCode('#');
          return;
      }
      if (!text.startsWith('#')) {
          setClientCode('#' + text.replace(/#/g, ''));
      } else {
          setClientCode(text);
      }
  };

  const handleAddClient = async () => {
      if (!clientCode.trim().startsWith('#') || clientCode.length < 7) {
          Alert.alert("Invalid Code", "Please enter a valid code starting with # (e.g. #123456)");
          return;
      }
      
      setAdding(true);
      try {
          await axios.post(`${API_URL}/coaches/${userId}/add-client`, {
              code: clientCode.trim()
          });
          Alert.alert("Success", "Client added to your list!");
          setIsModalVisible(false);
          setClientCode('#');
          fetchClients(userId);
      } catch (error: any) {
          const msg = error.response?.data?.detail || "Could not add client";
          Alert.alert("Error", msg);
      } finally {
          setAdding(false);
      }
  };

  const handleViewClient = (client) => {
      navigation.push({
          pathname: "/coachs/client-details",
          params: { clientId: client.id }
      });
  };

  const handleContactClient = () => {
      Alert.alert("Coming Soon", "Messaging feature is currently in development.");
  };

  const renderCoachItem = ({ item }) => (
    <View style={styles.coachItem}>
      <View style={styles.coachInfoContainer}>
        <View style={styles.coachAvatar}>
            <Text style={{fontSize: 20, fontWeight:'bold', color: '#2A4562'}}>
                {item.firstname ? item.firstname[0] : '?'}
            </Text>
        </View>
        <View style={styles.coachDetails}>
          <Text style={styles.coachName}>{item.firstname} {item.lastname}</Text>
          <Text style={styles.coachMeta}>Age: {item.age} • {item.gender}</Text>
          <Text style={styles.coachMeta}>Goal: {item.goal} kcal</Text>
        </View>
      </View>
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleContactClient}>
          <Text style={styles.actionButtonText}>Contact</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewClient(item)}>
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.header}>
          <Text style={styles.headerTitle}>My Clients</Text>
          <TouchableOpacity style={styles.addClientBtn} onPress={() => setIsModalVisible(true)}>
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addClientText}>Add</Text>
          </TouchableOpacity>
      </View>

      {loading ? (
          <ActivityIndicator size="large" color="#3498DB" style={{marginTop: 50}} />
      ) : (
        <FlatList
            data={clients}
            renderItem={renderCoachItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.coachList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <Text style={{color: 'white', textAlign: 'center', marginTop: 50}}>
                    No clients assigned yet. Use the Add button to invite via code.
                </Text>
            }
        />
      )}

      <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Add a Client</Text>
                  <Text style={styles.modalSubtitle}>Enter the unique code provided by the client</Text>
                  
                  <TextInput 
                      style={styles.input}
                      placeholder="#123456"
                      placeholderTextColor="#aaa"
                      value={clientCode}
                      onChangeText={handleCodeChange}
                      autoCapitalize="none"
                      maxLength={7}
                  />

                  <View style={styles.modalButtons}>
                      <TouchableOpacity 
                        style={[styles.modalBtn, {backgroundColor: '#e74c3c'}]}
                        onPress={() => setIsModalVisible(false)}
                      >
                          <Text style={styles.modalBtnText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.modalBtn, {backgroundColor: '#3498DB'}]}
                        onPress={handleAddClient}
                        disabled={adding}
                      >
                          <Text style={styles.modalBtnText}>{adding ? 'Adding...' : 'Confirm'}</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2B',
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 10
  },
  headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white'
  },
  addClientBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#3498DB',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20
  },
  addClientText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 5
  },
  coachList: {
    padding: 16,
  },
  coachItem: {
    backgroundColor: '#2A4562',
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
  },
  coachInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  coachDetails: {
    marginLeft: 10,
  },
  coachName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coachMeta: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: '#3498DB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: width * 0.3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center'
  },
  modalContainer: {
      width: '85%',
      backgroundColor: '#2A4562',
      borderRadius: 15,
      padding: 20,
      alignItems: 'center'
  },
  modalTitle: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10
  },
  modalSubtitle: {
      color: '#ccc',
      textAlign: 'center',
      marginBottom: 20
  },
  input: {
      backgroundColor: '#1A1F2B',
      width: '100%',
      color: 'white',
      padding: 15,
      borderRadius: 10,
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#3498DB'
  },
  modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%'
  },
  modalBtn: {
      flex: 1,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginHorizontal: 5
  },
  modalBtnText: {
      color: 'white',
      fontWeight: 'bold'
  }
});

export default CoachListScreen;