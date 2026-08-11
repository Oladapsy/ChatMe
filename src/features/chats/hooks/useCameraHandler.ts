import * as ImagePicker from "expo-image-picker";
import { useCameraPermissions } from "expo-camera";

export function useCameraHandler() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Capture photo with Expo Camera
  const takePhoto = async (): Promise<string | null> => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      return result.assets[0].uri;
    }
    return null;
  };

  // Pick existing photo from gallery
  const pickImage = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      return result.assets[0].uri;
    }
    return null;
  };

  return { takePhoto, pickImage };
}