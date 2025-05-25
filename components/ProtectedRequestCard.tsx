import { useAuth } from "@/context/auth";
import * as React from "react";
import { Button, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

export default function ProtectedRequestCard() {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = React.useState<any>(null);

  async function fetchProtectedData() {
    const response = await fetchWithAuth(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/protected/data`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    setData(data);
  }

  return (
    <View
      style={{
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "gray",
        width: "90%",
        padding: 10,
        borderRadius: 10,
      }}
    >
      <ThemedText type="defaultSemiBold">Requisição Protegida</ThemedText>
      <ThemedText
        style={{
          fontFamily: "monospace",
          padding: 10,
          borderRadius: 5,
          marginVertical: 10,
          fontSize: 12,
        }}
      >
        {data ? JSON.stringify(data, null, 2) : "Nenhum dado foi buscado ainda"}
      </ThemedText>
      <Button title="Buscar dados protegidos" onPress={fetchProtectedData} />
    </View>
  );
}
