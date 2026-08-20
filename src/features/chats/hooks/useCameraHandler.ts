import * as ImagePicker from "expo-image-picker";

export function useCameraHandler() {
  // Capture a single photo with the device camera
  const takePhoto = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      return result.assets[0].uri;
    }
    return null;
  };

  // Pick one or more photos from the gallery
  const pickImages = async (): Promise<string[]> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return [];

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      return result.assets.map((asset) => asset.uri);
    }
    return [];
  };

  return { takePhoto, pickImages };
}