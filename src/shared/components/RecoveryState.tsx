import { ActivityIndicator, Text, Pressable, View } from "react-native";
export function RecoveryState({ message, retry, back, loading = false }: { message: string; retry?: () => void; back?: () => void; loading?: boolean }) {
  return <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16, backgroundColor: "white" }}>
    {loading && <ActivityIndicator accessibilityLabel="Loading" />}
    <Text accessibilityRole="alert" style={{ color: "#172B4D", textAlign: "center" }}>{message}</Text>
    {retry && <Pressable accessibilityRole="button" onPress={retry}><Text style={{ color: "#005BBB", padding: 12 }}>Try again</Text></Pressable>}
    {back && <Pressable accessibilityRole="button" onPress={back}><Text style={{ color: "#005BBB", padding: 12 }}>Back to chats</Text></Pressable>}
  </View>;
}
