import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { restaurantStyles } from "../../assets/styles/restaurant.styles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import LoadingSpinner from "../../components/LoadingSpinner";

const HomeScreen = () => {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/restaurants`);
      const restaurantsData = await response.json();
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRestaurants();
  };

  const handleRestaurantPress = (restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  const renderRestaurantCard = ({ item }) => (
    <TouchableOpacity
      style={restaurantStyles.restaurantCard}
      onPress={() => handleRestaurantPress(item)}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/300x200" }}
        style={restaurantStyles.restaurantImage}
        contentFit="cover"
      />
      <View style={restaurantStyles.restaurantInfo}>
        <Text style={restaurantStyles.restaurantName}>{item.name}</Text>
        <Text style={restaurantStyles.restaurantCuisine}>{item.cuisine}</Text>
        <Text style={restaurantStyles.restaurantDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={restaurantStyles.restaurantMeta}>
          <View style={restaurantStyles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
            <Text style={restaurantStyles.restaurantAddress} numberOfLines={1}>
              {item.address || "Address not available"}
            </Text>
          </View>
          <TouchableOpacity style={restaurantStyles.viewMenuButton}>
            <Text style={restaurantStyles.viewMenuText}>View Menu</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={restaurantStyles.container}>
      <View style={restaurantStyles.header}>
        <Text style={restaurantStyles.title}>Restaurants</Text>
        <Text style={restaurantStyles.subtitle}>Discover amazing food near you</Text>
      </View>

      {restaurants.length === 0 ? (
        <View style={restaurantStyles.emptyState}>
          <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
          <Text style={restaurantStyles.emptyTitle}>No Restaurants Available</Text>
          <Text style={restaurantStyles.emptySubtitle}>Check back later for new restaurants</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={restaurantStyles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default HomeScreen;