import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, RotateCw, Zap, ZapOff, Check } from 'lucide-react-native';
import { savePhotoFile, savePhotoMetadata } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Image } from 'expo-image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

const MOODS = ['😊', '🤩', '😴', '🧘', '🤔', '💪', '🔥', '🌈'];

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

const CameraScreen = ({ navigation }: Props) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedMood, setSelectedMood] = useState('😊');
  const [isSaving, setIsSaving] = useState(false);
  
  const cameraRef = useRef<any>(null);
  const shutterOpacity = useSharedValue(0);

  const animatedShutterStyle = useAnimatedStyle(() => ({
    opacity: shutterOpacity.value,
  }));

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permissionText}>Camera access is required to take daily photos.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Allow Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      shutterOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        setCapturedUri(photo.uri);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to capture photo.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const savePhoto = async () => {
    if (!capturedUri || isSaving) return;
    setIsSaving(true);
    try {
      const localUri = await savePhotoFile(capturedUri);
      await savePhotoMetadata(localUri, caption, selectedMood);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save photo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (capturedUri) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.previewCard}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.retakeButton} onPress={() => setCapturedUri(null)}>
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map(m => (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.moodItem, selectedMood === m && styles.selectedMoodItem]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMood(m);
                  }}
                >
                  <Text style={styles.moodText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.labelRow}>
              <Text style={styles.label}>Add a caption</Text>
              <Text style={styles.charCount}>{caption.length}/120</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor={Colors.text.muted}
              value={caption}
              onChangeText={setCaption}
              maxLength={120}
              multiline
              returnKeyType="done"
            />

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={savePhoto}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="white" /> : (
                <>
                  <Text style={styles.saveButtonText}>Save Daily Moment</Text>
                  <Check size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing} 
        enableTorch={flash === 'on'}
        ref={cameraRef}
      >
        <Animated.View style={[styles.shutterOverlay, animatedShutterStyle]} />
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <X size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFlash(f => f === 'on' ? 'off' : 'on')} style={styles.iconButton}>
              {flash === 'on' ? <Zap size={24} color="#FFD700" /> : <ZapOff size={24} color="white" />}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')} style={styles.sideButton}>
              <RotateCw size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.outerCaptureButton} onPress={takePhoto} disabled={isCapturing}>
              <View style={styles.innerCaptureButton}>
                {isCapturing && <ActivityIndicator color="#000" size="small" />}
              </View>
            </TouchableOpacity>
            <View style={styles.sideButton} />
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  camera: { flex: 1 },
  shutterOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'white', zIndex: 10 },
  overlay: { flex: 1, justifyContent: 'space-between', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  sideButton: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
  outerCaptureButton: { width: 84, height: 84, borderRadius: 42, borderWidth: 6, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  innerCaptureButton: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 24, paddingTop: 60 },
  previewCard: { width: '100%', height: height * 0.4, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000', elevation: 10 },
  previewImage: { width: '100%', height: '100%' },
  retakeButton: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  form: { marginTop: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '700', color: Colors.text.main },
  charCount: { fontSize: 12, color: Colors.text.muted, fontWeight: '600' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  moodItem: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  selectedMoodItem: { backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.accent },
  moodText: { fontSize: 24 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 16, color: Colors.text.main, minHeight: 100, textAlignVertical: 'top', elevation: 2, marginBottom: 32 },
  saveButton: { backgroundColor: Colors.primary, borderRadius: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  permissionText: { color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 24 },
  permissionButton: { backgroundColor: 'white', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100 },
  permissionButtonText: { color: 'black', fontWeight: '700' },
});

export default CameraScreen;
