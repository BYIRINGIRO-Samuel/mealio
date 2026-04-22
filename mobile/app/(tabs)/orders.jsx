import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import { StyleSheet } from "react-native";

const OrdersScreen = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_URL}/orders/${user.id}`);
      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.restaurantName}>Restaurant ID: {item.restaurantId}</Text>
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
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>Start browsing restaurants to place your first order</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  listContainer: {
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
  restaurantName: {
    fontSize: 14,
    color: COLORS.textLight,
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
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
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

export default OrdersScreen;