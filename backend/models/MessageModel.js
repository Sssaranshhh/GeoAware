import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    }
})

const Message = mongoose.model('Message', messageSchema);
export default Message