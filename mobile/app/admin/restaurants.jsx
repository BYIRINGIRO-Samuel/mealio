import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

const RestaurantManagementScreen = () => {
  const { user } = useUser();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "",
    address: "",
    phone: "",
    email: "",
    image: ""
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants`);
      const data = await response.json();
      // Filter restaurants owned by current user
      const userRestaurants = data.filter(r => r.ownerId === user?.id);
      setRestaurants(userRestaurants);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRestaurant = async () => {
    try {
      const restaurantData = {
        ...formData,
        ownerId: user?.id
      };

      const url = editingRestaurant 
        ? `${API_URL}/restaurants/${editingRestaurant.id}`
        : `${API_URL}/restaurants`;
      
      const method = editingRestaurant ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restaurantData)
      });

      if (response.ok) {
        Alert.alert("Success", `Restaurant ${editingRestaurant ? "updated" : "created"} successfully!`);
        setModalVisible(false);
        resetForm();
        loadRestaurants();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save restaurant");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      cuisine: "",
      address: "",
      phone: "",
      email: "",
      image: ""
    });
    setEditingRestaurant(null);
  };

  const openEditModal = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description || "",
      cuisine: restaurant.cuisine || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      email: restaurant.email || "",
      image: restaurant.image || ""
    });
    setModalVisible(true);
  };

  const renderRestaurant = ({ item }) => (
    <View style={styles.restaurantCard}>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
        <Text style={styles.restaurantAddress}>{item.address}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Restaurants</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingRestaurant ? "Edit Restaurant" : "Add Restaurant"}
            </Text>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              resetForm();
            }}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Restaurant Name"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Cuisine Type"
              value={formData.cuisine}
              onChangeText={(text) => setFormData({...formData, cuisine: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              value={formData.image}
              onChangeText={(text) => setFormData({...formData, image: text})}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRestaurant}
            >
              <Text style={styles.saveButtonText}>
                {editingRestaurant ? "Update Restaurant" : "Create Restaurant"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
  },
  list: {
    padding: 20,
  },
  restaurantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
  },
  restaurantAddress: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RestaurantManagementScreen;