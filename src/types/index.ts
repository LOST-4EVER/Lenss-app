export interface Photo {
  id: number;
  uri: string;
  timestamp: string;
  caption?: string;
  mood?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Gallery: undefined;
  Settings: undefined;
};
