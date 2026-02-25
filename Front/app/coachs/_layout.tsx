import { Stack, router, usePathname } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CoachLayout() {
  const pathname = usePathname();

  // Pages where we hide the footer and show the back button
  const isSpecialPage =
    pathname === "/coachs/profile" ||
    pathname === "/coachs/subscription";

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={{ flex: 1, backgroundColor: "#0D1117" }}>

        {/* HEADER */}
        <View style={styles.header}>
          
          {/* LEFT SIDE: Profile or Back */}
          {isSpecialPage ? (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push("/coachs/profile")}>
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={20} color="white" />
              </View>
            </TouchableOpacity>
          )}

          {/* TITLE */}
          <Text style={styles.appName}>
            <Text style={styles.appNameBlue}>NUTRI</Text>
            <Text style={styles.appNameWhite}>TRAIN</Text>
          </Text>

          {/* RIGHT SIDE: Subscription Star */}
          {isSpecialPage ? (
            <View style={{ width: 30 }} /> 
          ) : (
            <TouchableOpacity 
              style={styles.starButton}
              onPress={() => router.push("/coachs/subscription")}
            >
              <Ionicons name="star" size={28} color="#EAEA45" />
            </TouchableOpacity>
          )}
        </View>

        {/* PAGE CONTENT */}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* FOOTER: Now with 4 Items including Settings */}
        {!isSpecialPage && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/coachs/home")}>
              <Ionicons 
                name="home" 
                size={26} 
                color={pathname === "/coachs/home" ? "#3498DB" : "white"} 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/coachs/client-list")}>
              <Ionicons 
                name="people" 
                size={26} 
                color={pathname === "/coachs/client-list" ? "#3498DB" : "white"} 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/coachs/forum")}>
              <Ionicons 
                name="chatbubbles" 
                size={26} 
                color={pathname === "/coachs/forum" ? "#3498DB" : "white"} 
              />
            </TouchableOpacity>

            {/* SETTINGS GEAR AT THE BOTTOM */}
            <TouchableOpacity onPress={() => router.push("/coachs/settings")}>
              <Ionicons 
                name="settings" 
                size={26} 
                color={pathname === "/coachs/settings" ? "#3498DB" : "white"} 
              />
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#161B22" },
  header: {
    height: 70,
    paddingHorizontal: 20,
    backgroundColor: "#161B22",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appName: { fontSize: 22, fontWeight: "bold" },
  appNameBlue: { color: "#3498DB" },
  appNameWhite: { color: "#FFFFFF" },
  profilePlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2A4562",
    justifyContent: 'center',
    alignItems: 'center'
  },
  starButton: { padding: 5 },
  footer: {
    height: 75,
    backgroundColor: "#161B22",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingBottom: 10, // Extra space for thumb navigation
  },
});