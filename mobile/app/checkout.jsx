import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../constants/api";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

const CheckoutScreen = () => {
  const { restaurantId, cartItems, totalAmount } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const [orderType, setOrderType] = useState("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState(user?.fullName || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cart = JSON.parse(cartItems);

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (orderType === "dine-in" && !tableNumber.trim()) {
      Alert.alert("Error", "Please enter your table number");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerId: user.id,
        restaurantId: parseInt(restaurantId),
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.price),
          specialInstructions: ""
        })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        notes: notes.trim(),
        orderType,
        tableNumber: orderType === "dine-in" ? tableNumber.trim() : null,
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          "Order Placed Successfully!",
          `Your order #${result.order.id} has been placed. You will receive updates on the status.`,
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/orders");
              },
            },
          ]
        );
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCartItem = (item, index) => (
    <View key={index} style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>
          ${parseFloat(item.price).toFixed(2)} x {item.quantity}
        </Text>
      </View>
      <Text style={styles.cartItemTotal}>
        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.map((item, index) => renderCartItem(item, index))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${parseFloat(totalAmount).toFixed(2)}</Text>
          </View>
        </View>

        {/* Order Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === "dine-in" && styles.selectedOrderType
              ]}
              onPress={() => setOrderType("dine-in")}
            >
              <Ionicons 
                name="restaurant" 
                size={20} 
                color={orderType === "dine-in" ? COLORS.white : COLORS.text} 
              />
              <Text style={[
                styles.orderTypeText,
                orderType === "dine-in" && styles.selectedOrderTypeText
              ]}>
                Dine In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === "takeaway" && styles.selectedOrderType
              ]}
              onPress={() => setOrderType("takeaway")}
            >
              <Ionicons 
                name="bag" 
                size={20} 
                color={orderType === "takeaway" ? COLORS.white : COLORS.text} 
              />
              <Text style={[
                styles.orderTypeText,
                orderType === "takeaway" && styles.selectedOrderTypeText
              ]}>
                Takeaway
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={customerEmail}
              onChangeText={setCustomerEmail}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {orderType === "dine-in" && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Table Number *</Text>
              <TextInput
                style={styles.textInput}
                value={tableNumber}
                onChangeText={setTableNumber}
                placeholder="Enter your table number"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Special Instructions</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special requests or dietary requirements..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isSubmitting && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          <Text style={styles.placeOrderButtonText}>
            {isSubmitting ? "Placing Order..." : `Place Order - $${parseFloat(totalAmount).toFixed(2)}`}
          </Text>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  orderTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: 8,
  },
  selectedOrderType: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  orderTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  selectedOrderTypeText: {
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  placeOrderButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CheckoutScreen;