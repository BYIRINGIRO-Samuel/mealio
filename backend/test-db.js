import { db } from "./src/config/db.js";
import { restaurantsTable } from "./src/db/schema.js";

async function testConnection() {
    try {
        console.log("Testing database connection...");
        const result = await db.select().from(restaurantsTable).limit(1);
        console.log("Database connection successful!");
        console.log("Existing restaurants:", result.length);

        if (result.length > 0) {
            console.log("Sample restaurant:", result[0]);
        }
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

testConnection();