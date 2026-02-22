import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    receiverType: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true
})

const Message = mongoose.model('Message', messageSchema);
export default Message