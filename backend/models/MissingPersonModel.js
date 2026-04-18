import mongoose from "mongoose";

const missingPersonSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    physicalDescription: {
        type: String,
        required: true
    },
    lastKnownLocation: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Missing", "Found"],
        default: "Missing"
    },
    updates: [{
        note: String,
        responderName: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    reportedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const MissingPerson = mongoose.model("MissingPerson", missingPersonSchema);
export default MissingPerson;
