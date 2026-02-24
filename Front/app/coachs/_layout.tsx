import { Stack, router, usePathname } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CoachLayout() {
  const pathname = usePathname();

  // Pages où il faut remplacer les boutons par "back" et cacher le footer
  const isSpecialPage =
    pathname === "/coachs/profile" ||
    pathname === "/coachs/subscription";

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={{ flex: 1, backgroundColor: "#0D1117" }}>

        {/* HEADER */}
        <View style={styles.header}>
          
          {/* LEFT SIDE */}
          {isSpecialPage ? (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push("/coachs/profile")}>
              <Image
                source={{ uri: "PATH" }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          )}

          {/* TITLE */}
          <Text style={styles.appName}>
            <Text style={styles.appNameBlue}>NUTRI</Text>
            <Text style={styles.appNameWhite}>TRAIN</Text>
          </Text>

          {/* RIGHT SIDE */}
          {isSpecialPage ? (
            <View style={{ width: 30 }} /> 
          ) : (
            <TouchableOpacity 
              style={styles.starButton}
              onPress={() => router.push("/coachs/subscription")}
            >
              <Ionicons name="star" size={30} color="#EAEA45" />
            </TouchableOpacity>
          )}

        </View>

        {/* PAGE CONTENT */}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* FOOTER */}
        {!isSpecialPage && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/coachs/home")}>
              <Ionicons name="home" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/coachs/client-list")}>
              <Ionicons name="list" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/coachs/forum")}>
              <Ionicons name="people" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161B22", // Même couleur que le header
  },
  header: {
    height: 70,
    paddingHorizontal: 20,
    backgroundColor: "#161B22",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starButton: {
    padding: 5,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  appNameBlue: {
    color: "#3498DB",
  },
  appNameWhite: {
    color: "#FFFFFF",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2C3E50",
  },
  footer: {
    height: 70,
    backgroundColor: "#161B22",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
});