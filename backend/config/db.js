import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URL)

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.log("error in mongodb", error);
        process.exit(1);
    }
}