import LoginForm from "@/components/LoginForm";
import ProfileCard from "@/components/ProfileCard";
import ProtectedRequestCard from "@/components/ProtectedRequestCard";
import { useAuth } from "@/context/auth";
import { ActivityIndicator } from "react-native";
import { ThemedView } from "../components/ThemedView";
export default function HomeScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <ProfileCard />
      <ProtectedRequestCard />
    </ThemedView>
  );
}
// import LoginForm from "@/components/LoginForm";
// import { useAuth } from "@/context/auth";
// import { BASE_URL } from "@/utils/constants";
// import { useState } from "react";
// import { ActivityIndicator, Button, Image, Text, View } from "react-native";

// export default function Index() {
//   const { user, isLoading, signOut, fetchWithAuth } = useAuth();
//   const [data, setData] = useState();

//   if (isLoading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <ActivityIndicator size={"large"} color="#0000ff" />
//       </View>
//     );
//   }

//   if (!user) {
//     return <LoginForm />;
//   }

//   async function getProtectedData() {
//     const response = await fetchWithAuth(`${BASE_URL}/api/protected/data`, {
//       method: "GET",
//     });

//     const data = await response.json();
//     setData(data);
//   }
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Image
//         source={{ uri: user.picture }}
//         style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 16 }}
//       />

//       <Text>{user.name}</Text>
//       <Text>{user.email}</Text>
//       <Button title="Logout" onPress={() => signOut()} />
//       <Text>{JSON.stringify(data)}</Text>
//       <Button title="Fetch protected data" onPress={getProtectedData} />
//     </View>
//   );
// }
