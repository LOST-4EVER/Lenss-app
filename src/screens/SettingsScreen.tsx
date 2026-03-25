import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, SafeAreaView, ScrollView, Alert, Platform } from 'react-native';
import { ChevronLeft, Bell, Lock, ShieldCheck, Trash2, Info } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';

const SettingsScreen = ({ navigation }: any) => {
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('20:00');

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const settings = await Notifications.getPermissionsAsync();
    setRemindersEnabled(settings.granted);
  };

  const toggleReminders = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications in settings to receive daily reminders.');
        setRemindersEnabled(false);
        return;
      }
      await scheduleDailyReminder();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    setRemindersEnabled(value);
  };

  const scheduleDailyReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for your daily photo! 📸",
        body: "Keep your streak alive and capture a moment from today.",
        sound: true,
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color={Colors.text.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={22} color={Colors.text.main} />
              <Text style={styles.settingLabel}>Daily Reminder</Text>
            </View>
            <Switch 
              value={remindersEnabled} 
              onValueChange={toggleReminders}
              trackColor={{ false: '#dee2e6', true: Colors.success }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.settingDescription}>
            We'll nudge you at 8:00 PM if you haven't taken your photo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Lock size={22} color={Colors.text.main} />
              <Text style={styles.settingLabel}>Biometric Lock</Text>
            </View>
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ShieldCheck size={22} color={Colors.text.main} />
              <Text style={styles.settingLabel}>Data Residency</Text>
            </View>
            <Text style={styles.statusText}>On-Device Only</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.dangerRow}>
            <View style={styles.settingInfo}>
              <Trash2 size={22} color="#dc3545" />
              <Text style={[styles.settingLabel, { color: '#dc3545' }]}>Clear All Data</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Info size={20} color={Colors.text.muted} />
          <Text style={styles.aboutText}>Lens v1.0.0 • 100% Private</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text.main, marginLeft: 8 },
  content: { flex: 1 },
  section: { padding: 24, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 16, fontWeight: '600', color: Colors.text.main },
  settingDescription: { fontSize: 13, color: Colors.text.secondary, marginTop: 4 },
  comingSoon: { fontSize: 12, fontWeight: '700', color: Colors.text.muted, backgroundColor: '#f1f3f5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 14, fontWeight: '600', color: Colors.success },
  dangerRow: { marginTop: 8 },
  aboutSection: { alignItems: 'center', padding: 40, gap: 8 },
  aboutText: { fontSize: 13, color: Colors.text.muted, fontWeight: '500' },
});

export default SettingsScreen;
