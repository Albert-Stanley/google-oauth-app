import { Image, Linking, Pressable, StyleSheet, View } from "react-native"; // Import Pressable
import { ThemedText } from "./ThemedText";

export default function Footer() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <View style={styles.footerContainer}>
      <ThemedText style={styles.expoAcknowledgment}>
        Feito com Expo SDK para React Native
      </ThemedText>

      <ThemedText style={styles.developedBy}>
        Desenvolvido por Albert
      </ThemedText>

      <View style={styles.developerLogosContainer}>
        {/* LinkedIn Logo with Pressable */}
        <Pressable
          onPress={() => openLink("https://www.linkedin.com/in/Albert-Stanley")}
          style={({ hovered }) => [
            styles.socialLogoPressable,
            hovered && styles.socialLogoHover,
          ]}
        >
          <Image
            source={require("@/assets/images/linkedin.png")}
            style={styles.socialLogo}
          />
        </Pressable>

        {/* GitHub Logo with Pressable */}
        <Pressable
          onPress={() => openLink("https://github.com/Albert-Stanley")}
          style={({ hovered }) => [
            styles.socialLogoPressable,
            hovered && styles.socialLogoHover,
          ]}
        >
          <Image
            source={require("@/assets/images/github.png")}
            style={styles.socialLogo}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
    width: "100%",
  },
  expoAcknowledgment: {
    fontSize: 12,
    color: "#888",
  },
  developedBy: {
    fontSize: 14,
    fontWeight: "bold",
  },
  developerLogosContainer: {
    flexDirection: "row",
    gap: 20,
  },
  socialLogo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  socialLogoPressable: {},

  socialLogoHover: {
    opacity: 0.7,
    transform: [{ scale: 1.1 }],
  },
});
