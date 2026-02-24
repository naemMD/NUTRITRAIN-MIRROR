import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Link } from '@react-navigation/native';

import { clearSession } from '@/services/authStorage';

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // États pour les notifications
  const [caloriesNotif, setCaloriesNotif] = useState(true);
  const [coachNotif, setCoachNotif] = useState(true);
  const [forumNotif, setForumNotif] = useState(true);
  
  // État pour le thème
  const [darkTheme, setDarkTheme] = useState(true);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <Text style={styles.sectionTitle}>Notifications</Text>
      
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>Reminder to track calories</Text>
          <View style={[styles.switchContainer, { backgroundColor: caloriesNotif ? '#81b0ff' : '#767577' }]}>
            <Switch
              value={caloriesNotif}
              onValueChange={setCaloriesNotif}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={caloriesNotif ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              style={styles.switchStyle}
            />
            <Text style={styles.switchStatus}>{caloriesNotif ? 'Activated' : 'Deactivated'}</Text>
          </View>
        </View>
        
        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>Notifications from coach</Text>
          <View style={[styles.switchContainer, { backgroundColor: coachNotif ? '#81b0ff' : '#767577' }]}>
            <Switch
              value={coachNotif}
              onValueChange={setCoachNotif}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={coachNotif ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              style={styles.switchStyle}
            />
            <Text style={styles.switchStatus}>{coachNotif ? 'Activated' : 'Deactivated'}</Text>
          </View>
        </View>
        
        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>Interaction from the forum</Text>
          <View style={[styles.switchContainer, { backgroundColor: forumNotif ? '#81b0ff' : '#767577' }]}>
            <Switch
              value={forumNotif}
              onValueChange={setForumNotif}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={forumNotif ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              style={styles.switchStyle}
            />
            <Text style={styles.switchStatus}>{forumNotif ? 'Activated' : 'Deactivated'}</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Themes</Text>
        
        <View style={styles.themeContainer}>
          <TouchableOpacity 
            style={[
              styles.themeButton, 
              { backgroundColor: darkTheme ? '#3498DB' : '#2A4562' }
            ]}
            onPress={() => setDarkTheme(!darkTheme)}
          >
            <Text style={styles.themeButtonText}>
              {darkTheme ? 'Dark theme ON' : 'Dark theme OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Other</Text>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await clearSession();
            router.push('/');
          }}
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
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
  contentContainer: {
    flex: 1,
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingRight: 10,
  },
  switchStyle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  switchStatus: {
    color: '#1A1F2B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  themeContainer: {
    marginBottom: 15,
  },
  themeButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '40%',
  },
  themeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF4757',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2A4562',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    padding: 10,
  },
});

export default NotificationsScreen;