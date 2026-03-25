import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView, Modal, Alert } from 'react-native';
import { Image } from 'expo-image';
import { getAllPhotos, deletePhoto } from '../utils/storage';
import { Photo, RootStackParamList } from '../types';
import { ChevronLeft, Calendar, Trash2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import Animated, { FadeIn, ScaleInCenter } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 2;
const ITEM_SIZE = (width - (COLUMN_COUNT + 1) * SPACING) / COLUMN_COUNT;

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>;

const GalleryScreen = ({ navigation }: Props) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const loadPhotos = useCallback(async () => {
    const data = await getAllPhotos();
    setPhotos(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos])
  );

  const formatDate = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  }, []);

  const handleDelete = async (photo: Photo) => {
    Alert.alert(
      'Delete Moment?',
      'This photo will be permanently removed from your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deletePhoto(photo.id, photo.uri);
            setSelectedPhoto(null);
            loadPhotos();
          }
        }
      ]
    );
  };

  const renderGridItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPhoto(item);
      }}
    >
      <Image source={{ uri: item.uri }} style={styles.image} cachePolicy="disk" />
      {item.mood && (
        <View style={styles.moodBadge}>
          <Text style={styles.moodBadgeText}>{item.mood}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color={Colors.text.main} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.header}>Your Lens</Text>
          <Text style={styles.subHeader}>{photos.length} Captured moments</Text>
        </View>
      </View>
      
      <FlatList
        data={photos}
        numColumns={COLUMN_COUNT}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGridItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={60} color={Colors.text.muted} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No memories yet</Text>
            <Text style={styles.emptyText}>Start your daily habit today!</Text>
          </View>
        }
      />

      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
              <TouchableOpacity 
                activeOpacity={1} 
                style={styles.modalBlur} 
                onPress={() => setSelectedPhoto(null)} 
              />
            </Animated.View>

            <Animated.View entering={ScaleInCenter} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalDate}>{formatDate(selectedPhoto.timestamp)}</Text>
                  {selectedPhoto.mood && <Text style={styles.modalMood}>Feeling {selectedPhoto.mood}</Text>}
                </View>
                <TouchableOpacity onPress={() => setSelectedPhoto(null)} style={styles.closeBtn}>
                  <X size={24} color={Colors.text.main} />
                </TouchableOpacity>
              </View>

              <Image source={{ uri: selectedPhoto.uri }} style={styles.modalImage} />

              <View style={styles.modalFooter}>
                <Text style={styles.modalCaption}>
                  {selectedPhoto.caption || "No caption for this moment."}
                </Text>
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(selectedPhoto)}
                >
                  <Trash2 size={22} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  headerTitleContainer: { flex: 1 },
  header: { fontSize: 20, fontWeight: '800', color: Colors.text.main },
  subHeader: { fontSize: 13, color: Colors.text.muted, fontWeight: '600' },
  listContent: { padding: SPACING },
  itemContainer: { width: ITEM_SIZE, height: ITEM_SIZE, margin: SPACING / 2, backgroundColor: Colors.border },
  image: { width: '100%', height: '100%' },
  moodBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' },
  moodBadgeText: { fontSize: 12 },
  emptyContainer: { flex: 1, height: height * 0.6, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '800', color: Colors.text.main },
  emptyText: { marginTop: 8, fontSize: 14, color: Colors.text.secondary, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBlur: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 32, overflow: 'hidden', elevation: 20 },
  modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalDate: { fontSize: 18, fontWeight: '800', color: Colors.text.main },
  modalMood: { fontSize: 14, color: Colors.text.secondary, marginTop: 2, fontWeight: '600' },
  closeBtn: { padding: 4 },
  modalImage: { width: '100%', height: width - 40, backgroundColor: '#000' },
  modalFooter: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  modalCaption: { flex: 1, fontSize: 16, lineHeight: 22, color: Colors.text.main, fontWeight: '500' },
  deleteBtn: { padding: 8, backgroundColor: '#fff5f5', borderRadius: 12 },
});

export default GalleryScreen;
