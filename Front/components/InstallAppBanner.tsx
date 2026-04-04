import { Pressable, StyleSheet, Text, View } from "react-native";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export function InstallAppBanner() {
  const { canShow, canNativeInstall, isIOS, isAndroidManual, promptInstall, state } =
    useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canShow || dismissed || state === "installed") {
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
          <Text style={styles.title}>Installer Staple</Text>

          {isIOS && (
            <Text style={styles.subtitle}>
              Appuyez sur le bouton Partager puis "Sur l'ecran d'accueil"
            </Text>
          )}

          {isAndroidManual && (
            <Text style={styles.subtitle}>
              Menu ⋮ puis "Ajouter a l'ecran d'accueil"
            </Text>
          )}

          {canNativeInstall && (
            <Text style={styles.subtitle}>
              Ajoutez l'app sur votre ecran d'accueil
            </Text>
          )}
        </View>
      </View>

      {canNativeInstall && (
        <Pressable style={styles.button} onPress={promptInstall}>
          <Text style={styles.buttonText}>Installer</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    // @ts-ignore — position: fixed is valid CSS on web
    position: "fixed",
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
    // @ts-ignore
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
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
