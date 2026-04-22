import { db } from "./src/config/db.js";
import { restaurantsTable, menuCategoriesTable, menuItemsTable } from "./src/db/schema.js";

async function simpleSeed() {
    try {
        console.log("Starting simple seed...");

        // Insert one restaurant
        const restaurant = await db.insert(restaurantsTable).values({
            ownerId: "sample_owner_1",
            name: "Bella Vista Italian",
            description: "Authentic Italian cuisine with fresh ingredients and traditional recipes.",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
            address: "123 Main Street, Downtown",
            phone: "+1 (555) 123-4567",
            email: "info@bellavista.com",
            cuisine: "Italian"
        }).returning();

        console.log("Inserted restaurant:", restaurant[0]);

        // Insert categories
        const categories = await db.insert(menuCategoriesTable).values([
            { restaurantId: restaurant[0].id, name: "Appetizers", description: "Start your meal", sortOrder: 1 },
            { restaurantId: restaurant[0].id, name: "Pasta", description: "Handmade pasta", sortOrder: 2 }
        ]).returning();

        console.log("Inserted categories:", categories.length);

        // Insert menu items
        const menuItems = await db.insert(menuItemsTable).values([
            {
                restaurantId: restaurant[0].id,
                categoryId: categories[0].id,
                name: "Bruschetta",
                description: "Toasted bread with tomatoes",
                price: "8.99",
                preparationTime: 10,
                isVegetarian: true
            },
            {
                restaurantId: restaurant[0].id,
                categoryId: categories[1].id,
                name: "Spaghetti Carbonara",
                description: "Classic Roman pasta",
                price: "18.99",
                preparationTime: 20
            }
        ]).returning();

        console.log("Inserted menu items:", menuItems.length);
        console.log("Seeding completed successfully!");

    } catch (error) {
        console.error("Seeding error:", error);
    }
}

simpleSeed();