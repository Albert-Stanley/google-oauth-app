import { useAuth } from "@/context/auth";
import { StyleSheet, useColorScheme, View } from "react-native";
import Footer from "./Footer";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export default function LoginForm() {
  const { signIn, isLoading } = useAuth();
  const theme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <ThemedText type="subtitle" style={styles.title}>
              Bem-vindo(a) ao Seu App
            </ThemedText>
            <ThemedText style={styles.description}>
              Experimente uma autenticação fluida{"\n"}
              desenvolvida por Albert.{"\n"}
            </ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <SignInWithGoogleButton onPress={signIn} disabled={isLoading} />
          </View>
        </View>
        <Footer />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  titleContainer: {
    alignItems: "center",
    gap: 12,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
    flex: 1,
  },
  contentContainer: {
    width: "100%",
    gap: 32,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
});
