import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGODB_URL)
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        // Don't exit — let the server stay up so /health still works
        // and logs are visible on Render
    }
}
