import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

const OrderManagementScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Get all orders for restaurants owned by current user
      const response = await fetch(`${API_URL}/admin/orders/${user?.id}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        Alert.alert("Success", "Order status updated successfully!");
        loadOrders();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return COLORS.warning;
      case "confirmed": return COLORS.info;
      case "preparing": return COLORS.primary;
      case "ready": return COLORS.success;
      case "delivered": return COLORS.success;
      case "cancelled": return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending": return "confirmed";
      case "confirmed": return "preparing";
      case "preparing": return "ready";
      case "ready": return "delivered";
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrder = ({ item }) => {
    const nextStatus = getNextStatus(item.status);
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.customerName}>Customer: {item.customerName}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        
        <View style={styles.orderDetails}>
          <Text style={styles.orderType}>
            <Ionicons name={item.orderType === "dine-in" ? "restaurant" : "bag"} size={16} />
            {" "}{item.orderType.replace("-", " ").toUpperCase()}
          </Text>
          {item.tableNumber && (
            <Text style={styles.tableNumber}>Table: {item.tableNumber}</Text>
          )}
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.totalAmount}>${parseFloat(item.totalAmount).toFixed(2)}</Text>
          <View style={styles.actions}>
            {nextStatus && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                onPress={() => updateOrderStatus(item.id, nextStatus)}
              >
                <Text style={styles.actionButtonText}>
                  Mark {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
            {item.status === "pending" && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                onPress={() => updateOrderStatus(item.id, "cancelled")}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Management</Text>
        <TouchableOpacity onPress={loadOrders}>
          <Ionicons name="refresh" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>Orders will appear here when customers place them</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ordersList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  customerName: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderType: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  tableNumber: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default OrderManagementScreen;