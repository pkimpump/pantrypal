import { Component } from 'react';
import { ViewProps } from 'react-native';

declare module 'expo-camera' {
  export enum CameraType {
    back = 'back',
    front = 'front',
  }

  export interface CameraProps extends ViewProps {
    type?: CameraType;
    ref?: any;
  }

  export interface CameraRef {
    takePictureAsync(): Promise<{ uri: string }>;
  }

  const Camera: React.ComponentType<CameraProps> & {
    requestCameraPermissionsAsync(): Promise<{ status: string }>;
  };

  export default Camera;
} 