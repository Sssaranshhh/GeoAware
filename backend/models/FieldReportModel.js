import mongoose from "mongoose";

const fieldReportSchema = new mongoose.Schema({
    responderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    responderName: {
        type: String,
        required: true
    },
    responderDesignation: {
        type: String,
        required: true
    },
    disasterType: {
        type: String,
        required: true,
        enum: ["landslide", "flood", "earthquake", "fire", "storm", "other"]
    },
    location: {
        type: String,
        required: true
    },
    peopleHelped: {
        type: Number,
        default: 0
    },
    injuredCount: {
        type: Number,
        default: 0
    },
    resourcesNeeded: {
        type: [String],
        default: []
    },
    roadCondition: {
        type: String,
        enum: ["passable", "blocked", "partially_blocked"],
        default: "passable"
    },
    notes: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "acknowledged", "fulfilled"],
        default: "pending"
    },
    adminNotes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const FieldReport = mongoose.model("FieldReport", fieldReportSchema);
export default FieldReport;
