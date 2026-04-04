import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export function InstallAppBanner() {
  const { canShow, canNativeInstall, isIOS, isAndroidManual, promptInstall, state } =
    useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (Platform.OS !== "web" || !canShow || dismissed || state === "installed") {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Pressable style={styles.close} onPress={() => setDismissed(true)}>
        <Ionicons name="close" size={18} color="#8A8D91" />
      </Pressable>

      <View style={styles.content}>
        <Ionicons name="download-outline" size={28} color="#3498DB" />
        <View style={styles.text}>
          <ThemedText style={styles.title}>Installer Staple</ThemedText>

          {isIOS && (
            <ThemedText style={styles.subtitle}>
              Appuyez sur{" "}
              <Ionicons name="share-outline" size={13} color="#3498DB" /> puis
              "Sur l'ecran d'accueil"
            </ThemedText>
          )}

          {isAndroidManual && (
            <ThemedText style={styles.subtitle}>
              Menu ⋮ puis "Ajouter a l'ecran d'accueil"
            </ThemedText>
          )}

          {canNativeInstall && (
            <ThemedText style={styles.subtitle}>
              Ajoutez l'app sur votre ecran d'accueil
            </ThemedText>
          )}
        </View>
      </View>

      {canNativeInstall && (
        <Pressable style={styles.button} onPress={promptInstall}>
          <ThemedText style={styles.buttonText}>Installer</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#1A1F2B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(52, 152, 219, 0.25)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }
      : {}),
    zIndex: 9999,
  },
  close: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    color: "#8A8D91",
    marginTop: 2,
  },
  button: {
    backgroundColor: "#3498DB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
