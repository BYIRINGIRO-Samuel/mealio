import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

const AdminScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  const adminOptions = [
    {
      id: 1,
      title: "Manage Restaurants",
      description: "Add, edit, and manage your restaurants",
      icon: "restaurant",
      route: "/admin/restaurants",
      color: COLORS.primary
    },
    {
      id: 2,
      title: "Order Management",
      description: "View and manage incoming orders",
      icon: "receipt",
      route: "/admin/orders",
      color: COLORS.success
    },
    {
      id: 3,
      title: "Analytics",
      description: "View sales and performance analytics",
      icon: "analytics",
      route: "/admin/analytics",
      color: COLORS.info
    },
    {
      id: 4,
      title: "Settings",
      description: "Configure app settings and preferences",
      icon: "settings",
      route: "/admin/settings",
      color: COLORS.warning
    }
  ];

  const renderAdminOption = ({ item }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={() => router.push(item.route)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color={COLORS.white} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{item.title}</Text>
        <Text style={styles.optionDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.firstName || "Admin"}</Text>
      </View>

      <FlatList
        data={adminOptions}
        renderItem={renderAdminOption}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.optionsList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            // Add logout functionality here
            router.replace("/(auth)/sign-in");
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  optionsList: {
    padding: 20,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.error,
  },
});

export default AdminScreen;