import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, RotateCw, Zap, ZapOff } from 'lucide-react-native';
import { savePhotoFile, savePhotoMetadata } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
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
      
      // Shutter animation
      shutterOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });
        
        const localUri = await savePhotoFile(photo.uri);
        await savePhotoMetadata(localUri);

        navigation.goBack();
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to capture photo.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

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
            <TouchableOpacity 
              style={styles.sideButton} 
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
            >
              <RotateCw size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.outerCaptureButton} 
              onPress={takePhoto} 
              disabled={isCapturing}
              activeOpacity={0.7}
            >
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  camera: {
    flex: 1,
  },
  shutterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCaptureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 6,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCaptureButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
  },
  permissionButtonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CameraScreen;
