"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Helper function to get color based on priority
const getPriorityColor = (priority) => {
    switch (priority) {
        case "critical":
            return "#dc3545"; // Red
        case "urgent":
            return "#ffc107"; // Yellow
        case "normal":
            return "#28a745"; // Green
        default:
            return "#6c757d"; // Gray
    }
};
exports.default = getPriorityColor;
