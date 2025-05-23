import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { ActivityIndicator, Button, Image, Text, View } from "react-native";

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
      {/* Imagem do usuário */}
      <Image
        source={{ uri: user.picture }}
        style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 16 }}
      />
      <Text>{user.sub}</Text>
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>

      <Button title="Logout" onPress={() => signOut()} />
    </View>
  );
}
