import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Default to local MongoDB if MONGODB_URI is not defined
        let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        
        // Ensure the URI has the proper scheme
        if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
            mongoUri = `mongodb://${mongoUri}`;
        }

        mongoose.connection.on('connected', () => console.log("Database Connected to:", mongoUri));
        mongoose.connection.on('error', (err) => console.error("Database connection error:", err));
        
        await mongoose.connect(`${mongoUri}`);
    } catch (error) {
        console.error("Database connection error:", error.message);
        console.log("Make sure MongoDB is running on localhost:27017");
        process.exit(1); // Exit the process if database connection fails
    }
}
export default connectDB