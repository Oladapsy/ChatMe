import { requireOptionalNativeModule } from "expo";

export interface GalleryPreview {
  id: string;
  uri: string;
}

// Expo Go and older development binaries may not contain the SDK 57 module.
// Load its JS only after checking the native module, so routes remain loadable.
export async function getRecentPhotos(): Promise<GalleryPreview[]> {
  if (!requireOptionalNativeModule("ExpoMediaLibraryNext")) return [];

  const { AssetField, MediaType, Query, requestPermissionsAsync } =
    await import("expo-media-library");
  const permission = await requestPermissionsAsync(false, ["photo"]);
  if (!permission.granted) return [];

  const assets = await new Query()
    .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
    .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
    .limit(20)
    .exe();

  return Promise.all(assets.map(async asset => ({
    id: asset.id,
    uri: await asset.getUri(),
  })));
}
