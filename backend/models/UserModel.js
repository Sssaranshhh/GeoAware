import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userType: {
        type: String,
        enum: ["User", "Admin", "Official"],
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    }
})

const User = mongoose.model('User', userSchema)
export default User;