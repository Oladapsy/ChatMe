import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { UserQrCodeScreen } from "@/features/chats/components/user/UserQrCodeScreen";
import { MOCK_USER_PROFILE } from "@/features/chats/data/mockUserProfile";

export default function UserQrRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    phone?: string;
    avatarUri?: string;
    qrValue?: string;
  }>();

  return (
    <UserQrCodeScreen
      name={params.name || MOCK_USER_PROFILE.name}
      phone={params.phone || MOCK_USER_PROFILE.phone}
      avatarUri={params.avatarUri || MOCK_USER_PROFILE.avatarUri}
      qrValue={params.qrValue || MOCK_USER_PROFILE.qrValue}
      onBack={() => router.back()}
      onScanQrPress={() => console.log("Open QR Scanner")}
    />
  );
}
