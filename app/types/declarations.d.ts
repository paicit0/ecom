declare module '*.png' {
    import { ImageSourceProp } from 'react-native';
    const value: ImageSourceProp;
    export default value;
  }
  
  declare module '*.jpg';
  declare module '*.jpeg'; 
  declare module '*.gif';
  declare module '*.webp'; 