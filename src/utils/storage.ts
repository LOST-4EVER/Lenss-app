import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Photo } from '../types';

const DATABASE_NAME = 'daily_photo.db';

let db: SQLite.SQLiteDatabase | null = null;

const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return db;
};

export const initDB = async () => {
  const sqlite = await getDB();
  await sqlite.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY NOT NULL, 
      uri TEXT NOT NULL, 
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const savePhotoMetadata = async (uri: string): Promise<number> => {
  try {
    const sqlite = await getDB();
    const result = await sqlite.runAsync('INSERT INTO photos (uri) VALUES (?);', [uri]);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Failed to save photo metadata:', error);
    throw error;
  }
};

export const getAllPhotos = async (): Promise<Photo[]> => {
  try {
    const sqlite = await getDB();
    const allRows = await sqlite.getAllAsync<Photo>('SELECT * FROM photos ORDER BY timestamp DESC;');
    return allRows;
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    return [];
  }
};

export const savePhotoFile = async (sourceUri: string): Promise<string> => {
  try {
    const photosDir = `${FileSystem.documentDirectory}photos/`;
    const fileName = `daily_${Date.now()}.jpg`;
    const destinationUri = `${photosDir}${fileName}`;
    
    const dirInfo = await FileSystem.getInfoAsync(photosDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
    }

    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.error('Failed to save photo file:', error);
    throw error;
  }
};
