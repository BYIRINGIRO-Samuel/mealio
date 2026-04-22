import express from "express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import {
  favoritesTable,
  restaurantsTable,
  menuCategoriesTable,
  menuItemsTable,
  ordersTable,
  orderItemsTable
} from "./db/schema.js";
import { and, eq, desc } from "drizzle-orm";
import job from "./config/cron.js";

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

// Enable CORS for all origins
app.use(cors({
  origin: "*", // Allow all origins for development
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

// Favorites endpoints
app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error fetching the favorites", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, parseInt(recipeId))
        )
      );

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error removing favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Restaurant endpoints
app.post("/api/restaurants", async (req, res) => {
  try {
    const { ownerId, name, description, image, address, phone, email, cuisine } = req.body;

    if (!ownerId || !name) {
      return res.status(400).json({ error: "Owner ID and name are required" });
    }

    const newRestaurant = await db
      .insert(restaurantsTable)
      .values({
        ownerId,
        name,
        description,
        image,
        address,
        phone,
        email,
        cuisine,
      })
      .returning();

    res.status(201).json(newRestaurant[0]);
  } catch (error) {
    console.log("Error creating restaurant", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/restaurants", async (req, res) => {
  try {
    const restaurants = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.isActive, true))
      .orderBy(desc(restaurantsTable.createdAt));

    res.status(200).json(restaurants);
  } catch (error) {
    console.log("Error fetching restaurants", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.id, parseInt(id)))
      .limit(1);

    if (restaurant.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json(restaurant[0]);
  } catch (error) {
    console.log("Error fetching restaurant", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Menu categories endpoints
app.post("/api/restaurants/:restaurantId/categories", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const newCategory = await db
      .insert(menuCategoriesTable)
      .values({
        restaurantId: parseInt(restaurantId),
        name,
        description,
      })
      .returning();

    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.log("Error creating category", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/restaurants/:restaurantId/categories", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await db
      .select()
      .from(menuCategoriesTable)
      .where(
        and(
          eq(menuCategoriesTable.restaurantId, parseInt(restaurantId)),
          eq(menuCategoriesTable.isActive, true)
        )
      )
      .orderBy(menuCategoriesTable.sortOrder);

    res.status(200).json(categories);
  } catch (error) {
    console.log("Error fetching categories", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Menu items endpoints
app.post("/api/restaurants/:restaurantId/menu-items", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const {
      categoryId, name, description, price, image, preparationTime,
      ingredients, allergens, isVegetarian, isVegan, isGlutenFree
    } = req.body;

    if (!categoryId || !name || !price) {
      return res.status(400).json({ error: "Category ID, name, and price are required" });
    }

    const newMenuItem = await db
      .insert(menuItemsTable)
      .values({
        restaurantId: parseInt(restaurantId),
        categoryId: parseInt(categoryId),
        name,
        description,
        price: price.toString(),
        image,
        preparationTime,
        ingredients,
        allergens,
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        isGlutenFree: isGlutenFree || false,
      })
      .returning();

    res.status(201).json(newMenuItem[0]);
  } catch (error) {
    console.log("Error creating menu item", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/restaurants/:restaurantId/menu-items", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const menuItems = await db
      .select()
      .from(menuItemsTable)
      .where(
        and(
          eq(menuItemsTable.restaurantId, parseInt(restaurantId)),
          eq(menuItemsTable.isAvailable, true)
        )
      )
      .orderBy(menuItemsTable.sortOrder);

    res.status(200).json(menuItems);
  } catch (error) {
    console.log("Error fetching menu items", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Orders endpoints
app.post("/api/orders", async (req, res) => {
  try {
    const {
      customerId, restaurantId, items, customerName, customerPhone,
      customerEmail, notes, orderType, tableNumber
    } = req.body;

    if (!customerId || !restaurantId || !items || items.length === 0 || !customerName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // Create order
    const newOrder = await db
      .insert(ordersTable)
      .values({
        customerId,
        restaurantId: parseInt(restaurantId),
        totalAmount: totalAmount.toString(),
        customerName,
        customerPhone,
        customerEmail,
        notes,
        orderType: orderType || "dine-in",
        tableNumber,
      })
      .returning();

    const orderId = newOrder[0].id;

    // Create order items
    const orderItems = await Promise.all(
      items.map(item =>
        db.insert(orderItemsTable)
          .values({
            orderId,
            menuItemId: parseInt(item.menuItemId),
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: (item.unitPrice * item.quantity).toString(),
            specialInstructions: item.specialInstructions,
          })
          .returning()
      )
    );

    res.status(201).json({ order: newOrder[0], items: orderItems.flat() });
  } catch (error) {
    console.log("Error creating order", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/orders/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.customerId, customerId))
      .orderBy(desc(ordersTable.createdAt));

    res.status(200).json(orders);
  } catch (error) {
    console.log("Error fetching orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.put("/api/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedOrder = await db
      .update(ordersTable)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(ordersTable.id, parseInt(orderId)))
      .returning();

    res.status(200).json(updatedOrder[0]);
  } catch (error) {
    console.log("Error updating order status", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/admin/orders/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Get all restaurants owned by this user
    const userRestaurants = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.ownerId, ownerId));

    if (userRestaurants.length === 0) {
      return res.status(200).json([]);
    }

    const restaurantIds = userRestaurants.map(r => r.id);

    // Get all orders for these restaurants
    const orders = await db
      .select()
      .from(ordersTable)
      .where(
        restaurantIds.length === 1
          ? eq(ordersTable.restaurantId, restaurantIds[0])
          : ordersTable.restaurantId.in ? ordersTable.restaurantId.in(restaurantIds) : eq(ordersTable.restaurantId, restaurantIds[0])
      )
      .orderBy(desc(ordersTable.createdAt));

    res.status(200).json(orders);
  } catch (error) {
    console.log("Error fetching admin orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.put("/api/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, address, phone, email, cuisine } = req.body;

    const updatedRestaurant = await db
      .update(restaurantsTable)
      .set({
        name,
        description,
        image,
        address,
        phone,
        email,
        cuisine,
      })
      .where(eq(restaurantsTable.id, parseInt(id)))
      .returning();

    if (updatedRestaurant.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json(updatedRestaurant[0]);
  } catch (error) {
    console.log("Error updating restaurant", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.put("/api/restaurants/:restaurantId/menu-items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId, name, description, price, image, preparationTime,
      ingredients, allergens, isVegetarian, isVegan, isGlutenFree
    } = req.body;

    const updatedMenuItem = await db
      .update(menuItemsTable)
      .set({
        categoryId: parseInt(categoryId),
        name,
        description,
        price: price.toString(),
        image,
        preparationTime,
        ingredients,
        allergens,
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        isGlutenFree: isGlutenFree || false,
      })
      .where(eq(menuItemsTable.id, parseInt(id)))
      .returning();

    if (updatedMenuItem.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.status(200).json(updatedMenuItem[0]);
  } catch (error) {
    console.log("Error updating menu item", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is accessible at http://0.0.0.0:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
});