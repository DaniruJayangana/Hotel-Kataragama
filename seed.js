const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load configurations
dotenv.config();

// Import Models
const Staff = require('./models/Staff');
const UserAccount = require('./models/UserAccount');
const RoomType = require('./models/RoomType');
const Room = require('./models/Room');
const MenuItem = require('./models/MenuItem');
const Supplier = require('./models/Supplier');
const InventoryItem = require('./models/InventoryItem');

const seedDatabase = async () => {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected for seeding...");

        // 1. CLEAR EXISTING DATA (Prevents duplicate Primary Key errors during testing)
        await Staff.deleteMany({});
        await UserAccount.deleteMany({});
        await RoomType.deleteMany({});
        await Room.deleteMany({});
        await MenuItem.deleteMany({});
        await Supplier.deleteMany({});
        await InventoryItem.deleteMany({});
        console.log("Cleared old records from target collections.");

        // 2. SEED STAFF & ADMINISTRATIVE CREDENTIALS
        const adminStaff = new Staff({
            _id: "STF001",
            first_name: "Daniru",
            last_name: "Jayangana",
            role: "General Manager",
            hire_date: new Date("2026-01-15"),
            salary: 85000
        });
        await adminStaff.save();

        const adminAccount = new UserAccount({
            staff_id: "STF001",
            username: "admin",
            password: "adminpassword123", // Note: Hash with bcrypt in live production deployment
            access_level: "Admin",
            is_active: true
        });
        await adminAccount.save();
        console.log("Seeding Completed: Staff Administrative credentials generated.");

        // 3. SEED ROOM TYPES
        const types = [
            { _id: "TYP01", type_name: "Single", base_price: 4500, max_occupancy: 1, amenities: ["AC", "Free Wi-Fi", "TV"] },
            { _id: "TYP02", type_name: "Double", base_price: 7500, max_occupancy: 2, amenities: ["AC", "Free Wi-Fi", "TV", "Mini Fridge"] },
            { _id: "TYP03", type_name: "Family", base_price: 12000, max_occupancy: 4, amenities: ["AC", "Free Wi-Fi", "TV", "Kitchenette", "Balcony"] },
            { _id: "TYP04", type_name: "Suite", base_price: 20000, max_occupancy: 2, amenities: ["AC", "Free Wi-Fi", "Smart TV", "Mini Fridge", "Jacuzzi"] }
        ];
        await RoomType.insertMany(types);
        console.log("Seeding Completed: Standard Room configurations registered.");

        // 4. SEED PHYSICAL ROOM NUMBERS
        const rooms = [
            { _id: "RM101", room_type_id: "TYP01", status: "Available" },
            { _id: "RM102", room_type_id: "TYP01", status: "Available" },
            { _id: "RM201", room_type_id: "TYP02", status: "Available" },
            { _id: "RM202", room_type_id: "TYP02", status: "Available" },
            { _id: "RM301", room_type_id: "TYP03", status: "Available" },
            { _id: "RM401", room_type_id: "TYP04", status: "Available" }
        ];
        await Room.insertMany(rooms);
        console.log("Seeding Completed: Physical guest rooms assigned.");

        // 5. SEED RESTAURANT MENU ITEMS
        const menuItems = [
            { _id: "FD001", item_name: "Sri Lankan Rice & Curry (Chicken)", category: "Food", price: 650, is_available: true },
            { _id: "FD002", item_name: "Fried Rice (Mixed)", category: "Food", price: 850, is_available: true },
            { _id: "FD003", item_name: "Devilled Prawns", category: "Food", price: 1200, is_available: true },
            { _id: "BV001", item_name: "Fresh Mango Juice", category: "Beverage", price: 350, is_available: true },
            { _id: "BV002", item_name: "Ceylon Black Tea", category: "Beverage", price: 120, is_available: true },
            { _id: "DS001", item_name: "Watalappan", category: "Dessert", price: 250, is_available: true }
        ];
        await MenuItem.insertMany(menuItems);
        console.log("Seeding Completed: Restaurant culinary menu established.");

        // 6. SEED INVENTORY SUPPLIERS & INITIAL STOCK ITEMS
        const sampleSupplier = new Supplier({
            _id: "SUP01",
            supplier_name: "Kataragama Wholesale Foods Ltd",
            contact_number: "0471234567",
            email: "supply@kataragamawholesale.lk"
        });
        await sampleSupplier.save();

        const inventoryItems = [
            { _id: "INV001", item_name: "Samba Rice Bags (25kg)", quantity_in_stock: 15, reorder_level: 5, supplier_id: "SUP01" },
            { _id: "INV002", item_name: "Ceylon Tea Leaves (1kg Pack)", quantity_in_stock: 2, reorder_level: 3, supplier_id: "SUP01" }, // Intentionally low for testing alert routes
            { _id: "INV003", item_name: "Cooking Oil (Liters)", quantity_in_stock: 40, reorder_level: 10, supplier_id: "SUP01" }
        ];
        await InventoryItem.insertMany(inventoryItems);
        console.log("Seeding Completed: Initial warehouse supplier inventory stocked.");

        console.log("\x1b[32m%s\x1b[0m", ">>> ENVIRONMENT SUCCESS: Database pipeline seeded without exceptions!");
        process.exit(0);
    } catch (err) {
        console.error("\x1b[31m%s\x1b[0m", ">>> ENVIRONMENT ERROR: Seeding routine crashed:", err.message);
        process.exit(1);
    }
};

seedDatabase();
