import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import LoadingSpinner from "../../components/LoadingSpinner";
import { StyleSheet } from "react-native";

const RestaurantScreen = () => {
  const { id: restaurantId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      
      const [restaurantRes, categoriesRes, menuItemsRes] = await Promise.all([
        fetch(`${API_URL}/restaurants/${restaurantId}`),
        fetch(`${API_URL}/restaurants/${restaurantId}/categories`),
        fetch(`${API_URL}/restaurants/${restaurantId}/menu-items`)
      ]);

      const restaurantData = await restaurantRes.json();
      const categoriesData = await categoriesRes.json();
      const menuItemsData = await menuItemsRes.json();

      setRestaurant(restaurantData);
      setCategories(categoriesData);
      setMenuItems(menuItemsData);
      
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error("Error loading restaurant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (menuItem) => {
    const existingItem = cart.find(item => item.id === menuItem.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }
  };

  const removeFromCart = (menuItemId) => {
    const existingItem = cart.find(item => item.id === menuItemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === menuItemId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== menuItemId));
    }
  };

  const getCartItemQuantity = (menuItemId) => {
    const item = cart.find(item => item.id === menuItemId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart before checkout");
      return;
    }
    
    router.push({
      pathname: "/checkout",
      params: { 
        restaurantId,
        cartItems: JSON.stringify(cart),
        totalAmount: getTotalAmount().toFixed(2)
      }
    });
  };

  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.categoryId === selectedCategory)
    : menuItems;

  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.selectedCategoryTab
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === item.id && styles.selectedCategoryTabText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }) => {
    const quantity = getCartItemQuantity(item.id);
    
    return (
      <View style={styles.menuItemCard}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/100x100" }}
          style={styles.menuItemImage}
          contentFit="cover"
        />
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.menuItemMeta}>
            <Text style={styles.menuItemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
            {item.preparationTime && (
              <Text style={styles.prepTime}>
                <Ionicons name="time-outline" size={14} />
                {" "}{item.preparationTime}min
              </Text>
            )}
          </View>
          <View style={styles.dietaryInfo}>
            {item.isVegetarian && <Text style={styles.dietaryTag}>🌱 Vegetarian</Text>}
            {item.isVegan && <Text style={styles.dietaryTag}>🌿 Vegan</Text>}
            {item.isGlutenFree && <Text style={styles.dietaryTag}>🌾 Gluten-Free</Text>}
          </View>
        </View>
        <View style={styles.quantityControls}>
          {quantity > 0 ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => removeFromCart(item.id)}
              >
                <Ionicons name="remove" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => addToCart(item)}
              >
                <Ionicons name="add" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item)}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Restaurant Header */}
        <View style={styles.restaurantHeader}>
          <Image
            source={{ uri: restaurant.image || "https://via.placeholder.com/400x200" }}
            style={styles.restaurantImage}
            contentFit="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
          
          <View style={styles.contactInfo}>
            {restaurant.address && (
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.contactText}>{restaurant.address}</Text>
              </View>
            )}
            {restaurant.phone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.contactText}>{restaurant.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <FlatList
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        )}

        {/* Menu Items */}
        <FlatList
          data={filteredMenuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.menuContainer}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>{cart.length} items</Text>
            <Text style={styles.cartTotal}>${getTotalAmount().toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  restaurantHeader: {
    position: "relative",
  },
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  restaurantInfo: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  selectedCategoryTab: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  selectedCategoryTabText: {
    color: COLORS.white,
  },
  menuContainer: {
    padding: 20,
  },
  menuItemCard: {
    flexDirection: "row",
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
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 18,
    marginBottom: 8,
  },
  menuItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  prepTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  dietaryInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dietaryTag: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  quantityControls: {
    justifyContent: "center",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    minWidth: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  cartFooter: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textLight,
  },
});

export default RestaurantScreen;