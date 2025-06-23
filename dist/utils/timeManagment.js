"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDuration = exports.timeToMinutes = void 0;
// Helper function to convert time string to minutes
const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.toLowerCase().split(/(?=[ap]m)/);
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "pm" && hours !== 12) {
        hours += 12;
    }
    else if (period === "am" && hours === 12) {
        hours = 0;
    }
    return hours * 60 + minutes;
};
exports.timeToMinutes = timeToMinutes;
// Helper function to calculate duration in minutes
const calculateDuration = (startTime, endTime) => {
    const startMinutes = (0, exports.timeToMinutes)(startTime);
    const endMinutes = (0, exports.timeToMinutes)(endTime);
    return endMinutes - startMinutes;
};
exports.calculateDuration = calculateDuration;
