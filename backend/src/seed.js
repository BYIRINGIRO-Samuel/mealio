import { db } from "./config/db.js";
import { restaurantsTable, menuCategoriesTable, menuItemsTable } from "./db/schema.js";

const sampleRestaurants = [
    {
        ownerId: "sample_owner_1",
        name: "Bella Vista Italian",
        description: "Authentic Italian cuisine with fresh ingredients and traditional recipes passed down through generations.",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
        address: "123 Main Street, Downtown",
        phone: "+1 (555) 123-4567",
        email: "info@bellavista.com",
        cuisine: "Italian"
    },
    {
        ownerId: "sample_owner_2",
        name: "Sakura Sushi Bar",
        description: "Fresh sushi and Japanese delicacies prepared by master chefs with the finest ingredients.",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
        address: "456 Oak Avenue, Midtown",
        phone: "+1 (555) 987-6543",
        email: "hello@sakurasushi.com",
        cuisine: "Japanese"
    },
    {
        ownerId: "sample_owner_3",
        name: "Spice Garden",
        description: "Aromatic Indian dishes with authentic spices and flavors from different regions of India.",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
        address: "789 Elm Street, Uptown",
        phone: "+1 (555) 456-7890",
        email: "contact@spicegarden.com",
        cuisine: "Indian"
    }
];

const sampleCategories = [
    // Bella Vista Italian (Restaurant ID: 1)
    { restaurantId: 1, name: "Appetizers", description: "Start your meal with our delicious appetizers", sortOrder: 1 },
    { restaurantId: 1, name: "Pasta", description: "Handmade pasta with authentic Italian sauces", sortOrder: 2 },
    { restaurantId: 1, name: "Pizza", description: "Wood-fired pizzas with fresh toppings", sortOrder: 3 },
    { restaurantId: 1, name: "Main Courses", description: "Traditional Italian main dishes", sortOrder: 4 },
    { restaurantId: 1, name: "Desserts", description: "Sweet endings to your meal", sortOrder: 5 },

    // Sakura Sushi Bar (Restaurant ID: 2)
    { restaurantId: 2, name: "Sushi Rolls", description: "Fresh sushi rolls made to order", sortOrder: 1 },
    { restaurantId: 2, name: "Sashimi", description: "Premium fresh fish sliced to perfection", sortOrder: 2 },
    { restaurantId: 2, name: "Appetizers", description: "Japanese starters and small plates", sortOrder: 3 },
    { restaurantId: 2, name: "Hot Dishes", description: "Cooked Japanese specialties", sortOrder: 4 },

    // Spice Garden (Restaurant ID: 3)
    { restaurantId: 3, name: "Starters", description: "Flavorful Indian appetizers", sortOrder: 1 },
    { restaurantId: 3, name: "Curries", description: "Rich and aromatic curry dishes", sortOrder: 2 },
    { restaurantId: 3, name: "Biryanis", description: "Fragrant rice dishes with spices", sortOrder: 3 },
    { restaurantId: 3, name: "Breads", description: "Fresh baked Indian breads", sortOrder: 4 },
];

const sampleMenuItems = [
    // Bella Vista Italian - Appetizers (Category ID: 1)
    {
        restaurantId: 1, categoryId: 1, name: "Bruschetta Classica",
        description: "Toasted bread topped with fresh tomatoes, basil, and garlic",
        price: "8.99", image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&h=200&fit=crop",
        preparationTime: 10, ingredients: "Bread, tomatoes, basil, garlic, olive oil",
        isVegetarian: true, sortOrder: 1
    },
    {
        restaurantId: 1, categoryId: 1, name: "Antipasto Platter",
        description: "Selection of cured meats, cheeses, olives, and vegetables",
        price: "16.99", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop",
        preparationTime: 15, ingredients: "Prosciutto, salami, mozzarella, olives, peppers",
        sortOrder: 2
    },

    // Bella Vista Italian - Pasta (Category ID: 2)
    {
        restaurantId: 1, categoryId: 2, name: "Spaghetti Carbonara",
        description: "Classic Roman pasta with eggs, cheese, pancetta, and black pepper",
        price: "18.99", image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
        preparationTime: 20, ingredients: "Spaghetti, eggs, pecorino cheese, pancetta, black pepper",
        sortOrder: 1
    },
    {
        restaurantId: 1, categoryId: 2, name: "Penne Arrabbiata",
        description: "Spicy tomato sauce with garlic, red chilies, and fresh herbs",
        price: "16.99", image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop",
        preparationTime: 18, ingredients: "Penne pasta, tomatoes, garlic, red chilies, basil",
        isVegetarian: true, sortOrder: 2
    },

    // Bella Vista Italian - Pizza (Category ID: 3)
    {
        restaurantId: 1, categoryId: 3, name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
        price: "14.99", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop",
        preparationTime: 25, ingredients: "Pizza dough, tomato sauce, mozzarella, basil",
        isVegetarian: true, sortOrder: 1
    },

    // Sakura Sushi Bar - Sushi Rolls (Category ID: 6)
    {
        restaurantId: 2, categoryId: 6, name: "California Roll",
        description: "Crab, avocado, and cucumber with sesame seeds",
        price: "12.99", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop",
        preparationTime: 15, ingredients: "Crab, avocado, cucumber, nori, sushi rice",
        sortOrder: 1
    },
    {
        restaurantId: 2, categoryId: 6, name: "Salmon Avocado Roll",
        description: "Fresh salmon and avocado wrapped in nori and rice",
        price: "14.99", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=300&h=200&fit=crop",
        preparationTime: 12, ingredients: "Fresh salmon, avocado, nori, sushi rice",
        sortOrder: 2
    },

    // Sakura Sushi Bar - Sashimi (Category ID: 7)
    {
        restaurantId: 2, categoryId: 7, name: "Salmon Sashimi",
        description: "6 pieces of fresh Atlantic salmon",
        price: "16.99", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop",
        preparationTime: 8, ingredients: "Fresh Atlantic salmon",
        sortOrder: 1
    },

    // Spice Garden - Starters (Category ID: 10)
    {
        restaurantId: 3, categoryId: 10, name: "Samosas",
        description: "Crispy pastries filled with spiced potatoes and peas",
        price: "7.99", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop",
        preparationTime: 15, ingredients: "Pastry, potatoes, peas, spices",
        isVegetarian: true, isVegan: true, sortOrder: 1
    },

    // Spice Garden - Curries (Category ID: 11)
    {
        restaurantId: 3, categoryId: 11, name: "Butter Chicken",
        description: "Tender chicken in a rich, creamy tomato-based sauce",
        price: "19.99", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
        preparationTime: 30, ingredients: "Chicken, tomatoes, cream, butter, spices",
        sortOrder: 1
    },
    {
        restaurantId: 3, categoryId: 11, name: "Dal Tadka",
        description: "Yellow lentils tempered with cumin, garlic, and spices",
        price: "14.99", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
        preparationTime: 25, ingredients: "Yellow lentils, cumin, garlic, turmeric, spices",
        isVegetarian: true, isVegan: true, sortOrder: 2
    }
];

export async function seedDatabase() {
    try {
        console.log("🌱 Starting database seeding...");

        // Insert restaurants
        console.log("📍 Inserting restaurants...");
        const insertedRestaurants = await db.insert(restaurantsTable).values(sampleRestaurants).returning();
        console.log(`✅ Inserted ${insertedRestaurants.length} restaurants`);

        // Insert categories
        console.log("📂 Inserting categories...");
        const insertedCategories = await db.insert(menuCategoriesTable).values(sampleCategories).returning();
        console.log(`✅ Inserted ${insertedCategories.length} categories`);

        // Insert menu items
        console.log("🍽️ Inserting menu items...");
        const insertedMenuItems = await db.insert(menuItemsTable).values(sampleMenuItems).returning();
        console.log(`✅ Inserted ${insertedMenuItems.length} menu items`);

        console.log("🎉 Database seeding completed successfully!");

        return {
            restaurants: insertedRestaurants,
            categories: insertedCategories,
            menuItems: insertedMenuItems
        };
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase()
        .then(() => {
            console.log("Seeding completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Seeding failed:", error);
            process.exit(1);
        });
}