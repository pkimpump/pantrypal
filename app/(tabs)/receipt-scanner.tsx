import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform, SafeAreaView } from 'react-native';
import { Camera, CameraType, CameraRef } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import receiptAnalyzer from '../services/receiptAnalyzer';
import database from '../services/database';
import CameraWrapper from '../components/CameraWrapper';

const ReceiptScanner: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      await database.initDatabase();
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri);
        analyzeReceiptImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeReceiptImage(result.assets[0].uri);
    }
  };

  const analyzeReceiptImage = async (imageUri: string) => {
    setAnalyzing(true);
    try {
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (!base64data) {
          throw new Error('Failed to convert image to base64');
        }
        
        const items = await receiptAnalyzer.analyzeReceipt(base64data);
        await database.addItems(items);
        
        Alert.alert(
          'Success',
          `Added ${items.length} items to your pantry`,
          [{ text: 'OK', onPress: () => setImage(null) }]
        );
        
        setAnalyzing(false);
      };
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      Alert.alert('Error', 'Failed to analyze receipt');
      setAnalyzing(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const content = (
    <View style={styles.container}>
      {!image ? (
        <CameraWrapper
          type={CameraType.back}
          ref={cameraRef}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <MaterialIcons name="camera-alt" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </CameraWrapper>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.preview} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setImage(null)}
            >
              <MaterialIcons name="close" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {analyzing && (
        <View style={styles.analyzingContainer}>
          <Text style={styles.analyzingText}>Analyzing receipt...</Text>
        </View>
      )}
    </View>
  );

  return Platform.OS === 'ios' ? <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView> : content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  analyzingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReceiptScanner; 