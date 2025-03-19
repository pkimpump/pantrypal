import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Camera as ExpoCamera, CameraType, CameraRef } from 'expo-camera';

interface CameraWrapperProps {
  type: CameraType;
  ref?: React.RefObject<CameraRef>;
  children?: React.ReactNode;
}

const CameraWrapper: React.FC<CameraWrapperProps> = ({ type, ref, children }) => {
  return (
    // @ts-ignore
    <ExpoCamera
      style={styles.camera}
      type={type}
      ref={ref}
    >
      {children}
    </ExpoCamera>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    ...(Platform.OS === 'ios' && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
  },
});

export default CameraWrapper; 