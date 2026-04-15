import { Router } from "express";
import FieldReport from "../models/FieldReportModel.js";

export const fieldReportRouter = Router();

// POST - Responder submits a field report
fieldReportRouter.post("/", async (req, res) => {
    const {
        responderId,
        responderName,
        responderDesignation,
        disasterType,
        location,
        peopleHelped,
        injuredCount,
        resourcesNeeded,
        roadCondition,
        notes
    } = req.body;

    try {
        const report = await FieldReport.create({
            responderId,
            responderName,
            responderDesignation,
            disasterType,
            location,
            peopleHelped,
            injuredCount,
            resourcesNeeded,
            roadCondition,
            notes
        });

        return res.status(201).json({
            success: true,
            message: "Field report submitted successfully",
            data: report
        });
    } catch (error) {
        console.error("Error creating field report:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit field report",
            error: error.message
        });
    }
});

// GET - Admin fetches all field reports
fieldReportRouter.get("/", async (req, res) => {
    try {
        const reports = await FieldReport.find()
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error("Error fetching field reports:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch field reports",
            error: error.message
        });
    }
});

// PUT - Admin updates report status
fieldReportRouter.put("/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    try {
        const updatedReport = await FieldReport.findByIdAndUpdate(
            id,
            { status, adminNotes },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({
                success: false,
                message: "Field report not found"
            });
        }

        return res.json({
            success: true,
            message: "Report status updated",
            data: updatedReport
        });
    } catch (error) {
        console.error("Error updating field report:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update report status",
            error: error.message
        });
    }
});
