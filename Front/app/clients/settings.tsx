import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Platform, ActivityIndicator } from 'react-native';
import { crossAlert } from '@/services/crossAlert';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { clearSession } from '@/services/authStorage';
import CGUModal from '@/components/CGUModal';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import api from '@/services/api';

const SettingsPage = () => {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { canShow, canNativeInstall, isIOS, isAndroidManual, promptInstall, state: installState } = useInstallPrompt();

  const [notifications, setNotifications] = useState({
    meals: true,
    coach: true,
    forum: true,
  });
  const [darkTheme, setDarkTheme] = useState(true);
  const [healthSync, setHealthSync] = useState(false);

  const handleLogout = () => {
    crossAlert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => {
          await clearSession();
          router.replace('/(tabs)/login');
      }}
    ]);
  };

  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await api.get('/users/me/export');
      const jsonStr = JSON.stringify(res.data, null, 2);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'staple-my-data.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        crossAlert('Data Export', 'Your data has been prepared. On mobile, data export is available via the web version.', [{ text: 'OK' }]);
      }
    } catch (err) {
      crossAlert('Error', 'Failed to export your data. Please try again.', [{ text: 'OK' }]);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    crossAlert(
      "Delete Account",
      "This will permanently delete your account and ALL your data (meals, workouts, messages, etc.). This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: () => {
            crossAlert(
              "Are you absolutely sure?",
              "All your personal data will be erased. This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, delete everything",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await api.delete('/users/me/account');
                      await clearSession();
                      router.replace('/(tabs)');
                    } catch (err) {
                      crossAlert('Error', 'Failed to delete account. Please try again.', [{ text: 'OK' }]);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingRow = ({ icon, title, value, onPress, isLast = false, color = "white", type = "chevron" }: any) => (
    <View style={[styles.item, isLast && { borderBottomWidth: 0 }]}>
      <TouchableOpacity 
        style={styles.itemLeft} 
        onPress={onPress} 
        disabled={type !== "chevron" || !onPress}
      >
        <Ionicons name={icon} size={22} color={color} style={{ width: 30 }} />
        <Text style={[styles.itemTitle, { color: color }]}>{title}</Text>
      </TouchableOpacity>
      
      {type === "switch" ? (
        <Switch 
            value={value} 
            onValueChange={onPress} 
            trackColor={{ false: "#767577", true: "#3498DB" }} 
            thumbColor="white"
        />
      ) : (
        <TouchableOpacity onPress={onPress} style={{flexDirection: 'row', alignItems: 'center'}}>
            {value && <Text style={styles.itemValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        <Text style={styles.mainTitle}>Settings</Text>

        <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon="person-outline" title="Edit Profile Info" onPress={() => router.push('/clients/profile')} />
          <SettingRow icon="medical-outline" title="Health Metrics (BMI, Body Fat)" onPress={() => {}} />
          <SettingRow icon="lock-closed-outline" title="Change Password" onPress={() => {}} isLast />
        </View>

        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.sectionCard}>
          <SettingRow 
            icon="restaurant-outline" 
            title="Meal Reminders" 
            type="switch" 
            value={notifications.meals} 
            onPress={() => toggleNotif('meals')} 
          />
          <SettingRow 
            icon="chatbubble-outline" 
            title="Coach Messages" 
            type="switch" 
            value={notifications.coach} 
            onPress={() => toggleNotif('coach')} 
          />
          <SettingRow 
            icon="people-outline" 
            title="Forum Activity" 
            type="switch" 
            value={notifications.forum} 
            onPress={() => toggleNotif('forum')} 
            isLast 
          />
        </View>

        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.sectionCard}>
          <SettingRow 
            icon="moon-outline" 
            title="Dark Theme" 
            type="switch" 
            value={darkTheme} 
            onPress={() => setDarkTheme(!darkTheme)} 
          />
          <SettingRow 
            icon="sync-outline" 
            title="Sync with Apple Health" 
            type="switch" 
            value={healthSync} 
            onPress={() => setHealthSync(!healthSync)} 
          />
          <SettingRow icon="fitness-outline" title="Units" value="kg / kcal" isLast onPress={() => {}} />
        </View>

        <Text style={styles.sectionLabel}>HELP & LEGAL</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon="help-circle-outline" title="Help Center" onPress={() => {}} />
          <SettingRow icon="document-text-outline" title="Terms of Service" onPress={() => setShowTerms(true)} />
          <SettingRow icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => setShowPrivacy(true)} isLast />
        </View>

        {canShow && installState !== 'installed' && (
          <>
            <Text style={styles.sectionLabel}>INSTALL APP</Text>
            <View style={styles.sectionCard}>
              {canNativeInstall ? (
                <SettingRow
                  icon="download-outline"
                  title="Add to Home Screen"
                  color="#3498DB"
                  onPress={promptInstall}
                  isLast
                />
              ) : isIOS ? (
                <View style={styles.item}>
                  <View style={styles.itemLeft}>
                    <Ionicons name="download-outline" size={22} color="#3498DB" style={{ width: 30 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: '#3498DB' }]}>Add to Home Screen</Text>
                      <Text style={styles.installHint}>
                        Tap the Share button then "Add to Home Screen"
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="share-outline" size={20} color="#3498DB" />
                </View>
              ) : isAndroidManual ? (
                <View style={styles.item}>
                  <View style={styles.itemLeft}>
                    <Ionicons name="download-outline" size={22} color="#3498DB" style={{ width: 30 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: '#3498DB' }]}>Add to Home Screen</Text>
                      <Text style={styles.installHint}>
                        Tap the menu ⋮ then "Add to Home Screen"
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="ellipsis-vertical" size={20} color="#3498DB" />
                </View>
              ) : null}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>MY DATA (RGPD)</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="download-outline"
            title={exporting ? "Exporting..." : "Export My Data"}
            color="#3498DB"
            onPress={handleExportData}
          />
          <SettingRow
            icon="document-text-outline"
            title="Consent Info"
            onPress={() => setShowPrivacy(true)}
            isLast
          />
        </View>

        <Text style={styles.sectionLabel}>DANGER ZONE</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="log-out-outline"
            title="Log Out"
            color="#e74c3c"
            onPress={handleLogout}
          />
          <SettingRow
            icon="trash-outline"
            title="Delete My Account"
            color="#e74c3c"
            onPress={handleDeleteAccount}
            isLast
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <CGUModal
        visible={showTerms}
        contentType="terms"
        onClose={() => setShowTerms(false)}
        onOpenPrivacyPolicy={() => {
          setShowTerms(false);
          setShowPrivacy(true);
        }}
      />
      <CGUModal
        visible={showPrivacy}
        contentType="privacy"
        onClose={() => setShowPrivacy(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2B',
  },
  scrollView: {
    paddingHorizontal: 16,
    marginTop: 15,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 25,
    marginTop: 10,
  },
  sectionLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 5,
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: '#2A4562',
    borderRadius: 15,
    marginBottom: 25,
    overflow: 'hidden',
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemTitle: {
    color: 'white',
    fontSize: 15,
    marginLeft: 10,
  },
  itemValue: {
    color: '#3498DB',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  version: {
    textAlign: 'center',
    color: '#555',
    fontSize: 11,
    marginTop: 10,
    marginBottom: 30,
  },
  installHint: {
    color: '#8A8D91',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 10,
  },
});

export default SettingsPage;