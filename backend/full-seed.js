import { db } from "./src/config/db.js";
import { restaurantsTable, menuCategoriesTable, menuItemsTable } from "./src/db/schema.js";

async function fullSeed() {
    try {
        console.log("Starting full seed...");

        // Insert restaurants
        const restaurants = await db.insert(restaurantsTable).values([
            {
                ownerId: "sample_owner_2",
                name: "Sakura Sushi Bar",
                description: "Fresh sushi and Japanese delicacies prepared by master chefs.",
                image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
                address: "456 Oak Avenue, Midtown",
                phone: "+1 (555) 987-6543",
                email: "hello@sakurasushi.com",
                cuisine: "Japanese"
            },
            {
                ownerId: "sample_owner_3",
                name: "Spice Garden",
                description: "Aromatic Indian dishes with authentic spices and flavors.",
                image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
                address: "789 Elm Street, Uptown",
                phone: "+1 (555) 456-7890",
                email: "contact@spicegarden.com",
                cuisine: "Indian"
            }
        ]).returning();

        console.log(`Inserted ${restaurants.length} more restaurants`);

        // Add more categories for restaurant 1 (Bella Vista)
        const bellaVistaCategories = await db.insert(menuCategoriesTable).values([
            { restaurantId: 1, name: "Pizza", description: "Wood-fired pizzas", sortOrder: 3 },
            { restaurantId: 1, name: "Main Courses", description: "Traditional Italian mains", sortOrder: 4 }
        ]).returning();

        // Add categories for Sakura Sushi (restaurant 2)
        const sakuraCategories = await db.insert(menuCategoriesTable).values([
            { restaurantId: 2, name: "Sushi Rolls", description: "Fresh sushi rolls", sortOrder: 1 },
            { restaurantId: 2, name: "Sashimi", description: "Premium fresh fish", sortOrder: 2 }
        ]).returning();

        // Add categories for Spice Garden (restaurant 3)
        const spiceCategories = await db.insert(menuCategoriesTable).values([
            { restaurantId: 3, name: "Starters", description: "Flavorful appetizers", sortOrder: 1 },
            { restaurantId: 3, name: "Curries", description: "Rich curry dishes", sortOrder: 2 }
        ]).returning();

        console.log("Added more categories");

        // Add more menu items
        const moreMenuItems = await db.insert(menuItemsTable).values([
            // Bella Vista Pizza
            {
                restaurantId: 1,
                categoryId: bellaVistaCategories[0].id,
                name: "Margherita Pizza",
                description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
                price: "14.99",
                image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop",
                preparationTime: 25,
                isVegetarian: true
            },
            // Sakura Sushi
            {
                restaurantId: 2,
                categoryId: sakuraCategories[0].id,
                name: "California Roll",
                description: "Crab, avocado, and cucumber with sesame seeds",
                price: "12.99",
                image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop",
                preparationTime: 15
            },
            {
                restaurantId: 2,
                categoryId: sakuraCategories[1].id,
                name: "Salmon Sashimi",
                description: "6 pieces of fresh Atlantic salmon",
                price: "16.99",
                image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop",
                preparationTime: 8
            },
            // Spice Garden
            {
                restaurantId: 3,
                categoryId: spiceCategories[0].id,
                name: "Samosas",
                description: "Crispy pastries filled with spiced potatoes and peas",
                price: "7.99",
                image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop",
                preparationTime: 15,
                isVegetarian: true,
                isVegan: true
            },
            {
                restaurantId: 3,
                categoryId: spiceCategories[1].id,
                name: "Butter Chicken",
                description: "Tender chicken in a rich, creamy tomato-based sauce",
                price: "19.99",
                image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
                preparationTime: 30
            }
        ]).returning();

        console.log(`Inserted ${moreMenuItems.length} more menu items`);
        console.log("Full seeding completed successfully!");

    } catch (error) {
        console.error("Full seeding error:", error);
    }
}

fullSeed();