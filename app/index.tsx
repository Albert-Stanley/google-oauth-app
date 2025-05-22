import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function Index() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size={"large"} color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{JSON.stringify(user)}</Text>
      <Button title="Logout" onPress={() => signOut()} />
    </View>
  );
}
