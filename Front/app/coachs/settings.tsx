import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { crossAlert } from '@/services/crossAlert';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { clearSession } from '@/services/authStorage';
import CGUModal from '@/components/CGUModal';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import api from '@/services/api';

const SettingsScreen = () => {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { canShow, canNativeInstall, isIOS, isAndroidManual, promptInstall, state: installState } = useInstallPrompt();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
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
      "This will permanently delete your account and ALL your data (clients, messages, workouts, etc.). Your clients will be unlinked. This action is irreversible.",
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

  const handleLogout = () => {
    crossAlert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => {
          await clearSession();
          router.replace('/(tabs)/login');
      }}
    ]);
  };

  const SettingItem = ({ icon, title, value, onPress, isLast = false, color = "white" }: any) => (
    <TouchableOpacity 
        style={[styles.item, isLast && { borderBottomWidth: 0 }]} 
        onPress={onPress}
        disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={color} style={{ width: 30 }} />
        <Text style={[styles.itemTitle, { color: color }]}>{title}</Text>
      </View>
      {value !== undefined ? (
        <Text style={styles.itemValue}>{value}</Text>
      ) : (
        onPress && <Ionicons name="chevron-forward" size={20} color="#555" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
      <Text style={styles.mainTitle}>App Settings</Text>

      <Text style={styles.sectionLabel}>ACCOUNT & SECURITY</Text>
      <View style={styles.sectionCard}>
        <SettingItem icon="person-outline" title="Personal Information" onPress={() => router.push('/coachs/profile')} />
        <SettingItem icon="lock-closed-outline" title="Change Password" onPress={() => {}} />
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <Ionicons name="finger-print-outline" size={22} color="white" style={{ width: 30 }} />
                <Text style={styles.itemTitle}>Face ID / Biometrics</Text>
            </View>
            <Switch value={biometric} onValueChange={setBiometric} trackColor={{ false: "#767577", true: "#3498DB" }} />
        </View>
        <SettingItem icon="mail-outline" title="Notification Email" value="Active" isLast />
      </View>

      <Text style={styles.sectionLabel}>COACHING PREFERENCES</Text>
      <View style={styles.sectionCard}>
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <Ionicons name="notifications-outline" size={22} color="white" style={{ width: 30 }} />
                <Text style={styles.itemTitle}>Client Activity Alerts</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#767577", true: "#3498DB" }} />
        </View>
        <SettingItem icon="globe-outline" title="App Language" value="English" onPress={() => {}} />
        <SettingItem icon="fitness-outline" title="Measurement Units" value="kg / cm" isLast onPress={() => {}} />
      </View>

      <Text style={styles.sectionLabel}>SUPPORT</Text>
      <View style={styles.sectionCard}>
        <SettingItem icon="help-circle-outline" title="Help Center" onPress={() => {}} />
        <SettingItem icon="document-text-outline" title="Terms of Service" onPress={() => setShowTerms(true)} />
        <SettingItem icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => setShowPrivacy(true)} isLast />
      </View>

      {canShow && installState !== 'installed' && (
        <>
          <Text style={styles.sectionLabel}>INSTALL APP</Text>
          <View style={styles.sectionCard}>
            {canNativeInstall ? (
              <SettingItem
                icon="download-outline"
                title="Add to Home Screen"
                color="#3498DB"
                onPress={promptInstall}
                isLast
              />
            ) : isIOS ? (
              <View style={[styles.item, { borderBottomWidth: 0 }]}>
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
              <View style={[styles.item, { borderBottomWidth: 0 }]}>
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
        <SettingItem
          icon="download-outline"
          title={exporting ? "Exporting..." : "Export My Data"}
          color="#3498DB"
          onPress={handleExportData}
        />
        <SettingItem
          icon="document-text-outline"
          title="Consent Info"
          onPress={() => setShowPrivacy(true)}
          isLast
        />
      </View>

      <Text style={styles.sectionLabel}>DANGER ZONE</Text>
      <View style={styles.sectionCard}>
        <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            color="#e74c3c"
            onPress={handleLogout}
        />
        <SettingItem
            icon="trash-outline"
            title="Delete My Account"
            color="#e74c3c"
            onPress={handleDeleteAccount}
            isLast
        />
      </View>

      <View style={{ height: 100 }} />

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B', padding: 16 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 25, marginTop: 10 },
  sectionLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 5, letterSpacing: 1 },
  sectionCard: { backgroundColor: '#2A4562', borderRadius: 15, marginBottom: 25, overflow: 'hidden' },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.05)' 
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { color: 'white', fontSize: 15, marginLeft: 10 },
  itemValue: { color: '#3498DB', fontSize: 14, fontWeight: '600' },
  version: { textAlign: 'center', color: '#555', fontSize: 11, marginTop: 10 },
  installHint: { color: '#8A8D91', fontSize: 12, marginTop: 2, marginLeft: 10 },
});

export default SettingsScreen;