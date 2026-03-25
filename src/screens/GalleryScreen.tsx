import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { getAllPhotos } from '../utils/storage';
import { Photo } from '../types';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 2;
const ITEM_SIZE = (width - (COLUMN_COUNT + 1) * SPACING) / COLUMN_COUNT;

// Memoized Photo Item for performance
const PhotoItem = React.memo(({ item, onFormatDate }: { item: Photo, onFormatDate: (t: string) => string }) => (
  <View style={styles.itemContainer}>
    <Image 
      source={{ uri: item.uri }} 
      style={styles.image}
      contentFit="cover"
      transition={200}
      cachePolicy="disk"
    />
    <View style={styles.dateOverlay}>
      <Text style={styles.dateText}>{onFormatDate(item.timestamp)}</Text>
    </View>
  </View>
));

const GalleryScreen = ({ navigation }: any) => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    let isMounted = true;
    getAllPhotos().then(data => {
      if (isMounted) setPhotos(data);
    });
    return () => { isMounted = false; };
  }, []);

  const formatDate = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Photo }) => (
    <PhotoItem item={item} onFormatDate={formatDate} />
  ), [formatDate]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={28} color="#212529" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.header}>History</Text>
          <Text style={styles.subHeader}>{photos.length} memories captured</Text>
        </View>
      </View>
      
      <FlatList
        data={photos}
        numColumns={COLUMN_COUNT}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE + SPACING,
          offset: (ITEM_SIZE + SPACING) * Math.floor(index / COLUMN_COUNT),
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={48} color="#dee2e6" />
            <Text style={styles.emptyText}>No photos yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212529',
  },
  subHeader: {
    fontSize: 13,
    color: '#adb5bd',
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: SPACING / 2,
    backgroundColor: '#f8f9fa',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dateText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#adb5bd',
  },
});

export default GalleryScreen;
