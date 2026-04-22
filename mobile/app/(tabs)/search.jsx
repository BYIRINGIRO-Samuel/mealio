import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { useDebounce } from "../../hooks/useDebounce";
import { searchStyles } from "../../assets/styles/search.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import LoadingSpinner from "../../components/LoadingSpinner";

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("restaurants");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const searchRestaurants = async (query) => {
    try {
      const response = await fetch(`${API_URL}/restaurants`);
      const allRestaurants = await response.json();
      
      if (!query.trim()) {
        return allRestaurants;
      }

      return allRestaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching restaurants:", error);
      return [];
    }
  };

  const searchMenuItems = async (query) => {
    try {
      // Get all restaurants first
      const restaurantsResponse = await fetch(`${API_URL}/restaurants`);
      const allRestaurants = await restaurantsResponse.json();
      
      let allMenuItems = [];
      
      // Get menu items from all restaurants
      for (const restaurant of allRestaurants) {
        try {
          const menuResponse = await fetch(`${API_URL}/restaurants/${restaurant.id}/menu-items`);
          const menuItems = await menuResponse.json();
          
          // Add restaurant info to each menu item
          const itemsWithRestaurant = menuItems.map(item => ({
            ...item,
            restaurantName: restaurant.name,
            restaurantId: restaurant.id
          }));
          
          allMenuItems = [...allMenuItems, ...itemsWithRestaurant];
        } catch (error) {
          console.error(`Error loading menu for restaurant ${restaurant.id}:`, error);
        }
      }

      if (!query.trim()) {
        return allMenuItems.slice(0, 20); // Limit initial results
      }

      return allMenuItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.ingredients?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching menu items:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [restaurantResults, menuResults] = await Promise.all([
          searchRestaurants(""),
          searchMenuItems("")
        ]);
        setRestaurants(restaurantResults);
        setMenuItems(menuResults);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialLoading) return;

    const handleSearch = async () => {
      setLoading(true);

      try {
        const [restaurantResults, menuResults] = await Promise.all([
          searchRestaurants(debouncedSearchQuery),
          searchMenuItems(debouncedSearchQuery)
        ]);
        setRestaurants(restaurantResults);
        setMenuItems(menuResults);
      } catch (error) {
        console.error("Error searching:", error);
        setRestaurants([]);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [debouncedSearchQuery, initialLoading]);

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={searchStyles.restaurantCard}
      onPress={() => router.push(`/restaurant/${item.id}`)}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/80x80" }}
        style={searchStyles.restaurantImage}
        contentFit="cover"
      />
      <View style={searchStyles.restaurantInfo}>
        <Text style={searchStyles.restaurantName}>{item.name}</Text>
        <Text style={searchStyles.restaurantCuisine}>{item.cuisine}</Text>
        <Text style={searchStyles.restaurantAddress} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={searchStyles.menuItemCard}
      onPress={() => router.push(`/restaurant/${item.restaurantId}`)}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/60x60" }}
        style={searchStyles.menuItemImage}
        contentFit="cover"
      />
      <View style={searchStyles.menuItemInfo}>
        <Text style={searchStyles.menuItemName}>{item.name}</Text>
        <Text style={searchStyles.restaurantName}>{item.restaurantName}</Text>
        <Text style={searchStyles.menuItemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (initialLoading) return <LoadingSpinner message="Loading..." />;

  const currentData = activeTab === "restaurants" ? restaurants : menuItems;
  const renderItem = activeTab === "restaurants" ? renderRestaurant : renderMenuItem;

  return (
    <View style={searchStyles.container}>
      <View style={searchStyles.searchSection}>
        <View style={searchStyles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textLight}
            style={searchStyles.searchIcon}
          />
          <TextInput
            style={searchStyles.searchInput}
            placeholder="Search restaurants, dishes..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={searchStyles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <View style={searchStyles.tabContainer}>
          <TouchableOpacity
            style={[
              searchStyles.tab,
              activeTab === "restaurants" && searchStyles.activeTab
            ]}
            onPress={() => setActiveTab("restaurants")}
          >
            <Text style={[
              searchStyles.tabText,
              activeTab === "restaurants" && searchStyles.activeTabText
            ]}>
              Restaurants ({restaurants.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              searchStyles.tab,
              activeTab === "menu" && searchStyles.activeTab
            ]}
            onPress={() => setActiveTab("menu")}
          >
            <Text style={[
              searchStyles.tabText,
              activeTab === "menu" && searchStyles.activeTabText
            ]}>
              Menu Items ({menuItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={searchStyles.resultsSection}>
        {loading ? (
          <View style={searchStyles.loadingContainer}>
            <LoadingSpinner message="Searching..." size="small" />
          </View>
        ) : (
          <FlatList
            data={currentData}
            renderItem={renderItem}
            keyExtractor={(item) => `${activeTab}-${item.id}`}
            contentContainerStyle={searchStyles.resultsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NoResultsFound />}
          />
        )}
      </View>
    </View>
  );
};

function NoResultsFound() {
  return (
    <View style={searchStyles.emptyState}>
      <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
      <Text style={searchStyles.emptyTitle}>No results found</Text>
      <Text style={searchStyles.emptyDescription}>
        Try adjusting your search or try different keywords
      </Text>
    </View>
  );
}

export default SearchScreen;