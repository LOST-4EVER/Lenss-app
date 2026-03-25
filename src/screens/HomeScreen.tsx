import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, Image as ImageIcon, Flame, CheckCircle2, Settings as SettingsIcon } from 'lucide-react-native';
import { useStreak } from '../hooks/useStreak';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { streak, hasTakenToday, refreshStreak } = useStreak();

  useFocusEffect(
    useCallback(() => {
      refreshStreak();
    }, [refreshStreak])
  );

  const handleCameraPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Camera');
  }, [navigation]);

  const handleGalleryPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Gallery');
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Settings');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, '#e9ecef']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>Lens</Text>
            <View style={[styles.streakCard, streak > 0 ? styles.activeStreak : styles.inactiveStreak]}>
              <Flame size={18} color={streak > 0 ? Colors.accent : Colors.text.secondary} fill={streak > 0 ? Colors.accent : "transparent"} />
              <Text style={[styles.streakValue, streak > 0 ? styles.activeText : styles.inactiveText]}>{streak}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsBtn}>
            <SettingsIcon size={24} color={Colors.text.main} />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.card}>
            {hasTakenToday ? (
              <View style={styles.completedContainer}>
                <View style={styles.successIconBg}>
                  <CheckCircle2 size={40} color={Colors.success} strokeWidth={3} />
                </View>
                <Text style={styles.cardTitle}>Today is captured!</Text>
                <Text style={styles.cardSubtitle}>Your streak is growing stronger.</Text>
              </View>
            ) : (
              <View style={styles.pendingContainer}>
                <Text style={styles.cardTitle}>Ready for today?</Text>
                <Text style={styles.cardSubtitle}>Don't let your {streak}-day streak end!</Text>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleCameraPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.gradientButton}
                  >
                    <Camera size={28} color={Colors.text.light} />
                    <Text style={styles.buttonText}>Capture Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.galleryNav}
            onPress={handleGalleryPress}
            activeOpacity={0.6}
          >
            <View style={styles.iconCircle}>
              <ImageIcon size={22} color={Colors.text.main} />
            </View>
            <Text style={styles.navText}>History</Text>
          </TouchableOpacity>
          
          <Text style={styles.privacyTag}>Offline & Private</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#212529',
    letterSpacing: -1,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeStreak: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff8a5c',
  },
  inactiveStreak: {
    backgroundColor: '#f1f3f5',
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 6,
  },
  activeText: {
    color: '#FF4500',
  },
  inactiveText: {
    color: '#6c757d',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  completedContainer: {
    alignItems: 'center',
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e7f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pendingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  navText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  privacyTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#adb5bd',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default HomeScreen;
