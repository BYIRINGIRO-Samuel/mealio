import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, Switch } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "../../../constants/api";
import { COLORS } from "../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

const MenuManagementScreen = () => {
  const { restaurantId } = useLocalSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    preparationTime: "",
    ingredients: "",
    allergens: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    loadCategories();
    loadMenuItems();
  }, [restaurantId]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories`);
      const data = await response.json();
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu-items`);
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Error loading menu items:", error);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryFormData)
      });

      if (response.ok) {
        Alert.alert("Success", "Category created successfully!");
        setCategoryModalVisible(false);
        setCategoryFormData({ name: "", description: "" });
        loadCategories();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create category");
    }
  };

  const handleSaveMenuItem = async () => {
    try {
      const menuItemData = {
        ...itemFormData,
        categoryId: selectedCategory,
        price: parseFloat(itemFormData.price),
        preparationTime: itemFormData.preparationTime ? parseInt(itemFormData.preparationTime) : null
      };

      const url = editingItem 
        ? `${API_URL}/restaurants/${restaurantId}/menu-items/${editingItem.id}`
        : `${API_URL}/restaurants/${restaurantId}/menu-items`;
      
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuItemData)
      });

      if (response.ok) {
        Alert.alert("Success", `Menu item ${editingItem ? "updated" : "created"} successfully!`);
        setModalVisible(false);
        resetItemForm();
        loadMenuItems();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save menu item");
    }
  };

  const resetItemForm = () => {
    setItemFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      preparationTime: "",
      ingredients: "",
      allergens: "",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false
    });
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      image: item.image || "",
      preparationTime: item.preparationTime?.toString() || "",
      ingredients: item.ingredients || "",
      allergens: item.allergens || "",
      isVegetarian: item.isVegetarian || false,
      isVegan: item.isVegan || false,
      isGlutenFree: item.isGlutenFree || false
    });
    setModalVisible(true);
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

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItemCard}>
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.menuItemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => openEditModal(item)}
      >
        <Ionicons name="pencil" size={16} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryHeader}>
        <FlatList
          data={categories}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
        <TouchableOpacity
          style={styles.addCategoryButton}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addCategoryText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMenuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.menuList}
      />

      {/* Menu Item Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </Text>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              resetItemForm();
            }}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={itemFormData.name}
              onChangeText={(text) => setItemFormData({...itemFormData, name: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={itemFormData.description}
              onChangeText={(text) => setItemFormData({...itemFormData, description: text})}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={itemFormData.price}
              onChangeText={(text) => setItemFormData({...itemFormData, price: text})}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Preparation Time (minutes)"
              value={itemFormData.preparationTime}
              onChangeText={(text) => setItemFormData({...itemFormData, preparationTime: text})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              value={itemFormData.image}
              onChangeText={(text) => setItemFormData({...itemFormData, image: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Ingredients"
              value={itemFormData.ingredients}
              onChangeText={(text) => setItemFormData({...itemFormData, ingredients: text})}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Vegetarian</Text>
              <Switch
                value={itemFormData.isVegetarian}
                onValueChange={(value) => setItemFormData({...itemFormData, isVegetarian: value})}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Vegan</Text>
              <Switch
                value={itemFormData.isVegan}
                onValueChange={(value) => setItemFormData({...itemFormData, isVegan: value})}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Gluten Free</Text>
              <Switch
                value={itemFormData.isGlutenFree}
                onValueChange={(value) => setItemFormData({...itemFormData, isGlutenFree: value})}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveMenuItem}
            >
              <Text style={styles.saveButtonText}>
                {editingItem ? "Update Item" : "Create Item"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Category</Text>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={categoryFormData.name}
              onChangeText={(text) => setCategoryFormData({...categoryFormData, name: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={categoryFormData.description}
              onChangeText={(text) => setCategoryFormData({...categoryFormData, description: text})}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveCategory}
            >
              <Text style={styles.saveButtonText}>Create Category</Text>
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
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
  },
  categoryHeader: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
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
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  addCategoryText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  menuList: {
    padding: 20,
  },
  menuItemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  menuItemDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 8,
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
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

export default MenuManagementScreen;