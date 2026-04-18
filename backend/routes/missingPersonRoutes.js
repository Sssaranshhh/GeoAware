import { Router } from "express";
import MissingPerson from "../models/MissingPersonModel.js";
import upload from "../middlewares/uploadMiddleware.js";

export const missingPersonRouter = Router();

// POST - Submit a new missing person report (with optional image)
missingPersonRouter.post("/", upload.single('image'), async (req, res) => {
    const {
        reporterId,
        name,
        age,
        physicalDescription,
        lastKnownLocation,
        contactNumber
    } = req.body;

    try {
        const imageUrl = req.file ? req.file.path : "";

        const report = await MissingPerson.create({
            reporterId,
            name,
            age,
            physicalDescription,
            lastKnownLocation,
            contactNumber,
            imageUrl
        });

        return res.status(201).json({
            success: true,
            message: "Missing person report submitted successfully",
            data: report
        });
    } catch (error) {
        console.error("Error creating missing person report:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit report",
            error: error.message
        });
    }
});

// GET - Fetch all missing person reports
missingPersonRouter.get("/", async (req, res) => {
    try {
        const reports = await MissingPerson.find()
            .sort({ reportedAt: -1 });

        return res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reports",
            error: error.message
        });
    }
});

// PUT - Update status to "Found" (Admin action)
missingPersonRouter.put("/:id/found", async (req, res) => {
    const { id } = req.params;

    try {
        const updatedReport = await MissingPerson.findByIdAndUpdate(
            id,
            { status: "Found" },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        return res.json({
            success: true,
            message: "Person marked as Found",
            data: updatedReport
        });
    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message
        });
    }
});

// POST - Add a field note (Responder action)
missingPersonRouter.post("/:id/update", async (req, res) => {
    const { id } = req.params;
    const { note, responderName } = req.body;

    try {
        const report = await MissingPerson.findById(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        report.updates.push({ note, responderName });
        await report.save();

        return res.json({
            success: true,
            message: "Field update added",
            data: report
        });
    } catch (error) {
        console.error("Error adding update:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add update",
            error: error.message
        });
    }
});
