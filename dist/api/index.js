"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const auth_routes_1 = __importDefault(require("../routes/auth.routes"));
const leave_routes_1 = __importDefault(require("../routes/leave.routes"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const globalVariables_1 = require("../utils/globalVariables");
const cors_1 = __importDefault(require("cors"));
const overtime_routes_1 = __importDefault(require("../routes/overtime.routes"));
const monthlyLeaveUsage_routes_1 = __importDefault(require("../routes/monthlyLeaveUsage.routes"));
const monthlyOvertimeUsage_routes_1 = __importDefault(require("../routes/monthlyOvertimeUsage.routes"));
const vacation_routes_1 = __importDefault(require("../routes/vacation.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const port = process.env.API_PORT || 5173;
app.use("/api", [
    auth_routes_1.default,
    leave_routes_1.default,
    user_routes_1.default,
    overtime_routes_1.default,
    monthlyLeaveUsage_routes_1.default,
    monthlyOvertimeUsage_routes_1.default,
    vacation_routes_1.default,
]);
app.get("/", (0, express_async_handler_1.default)(async (req, res, next) => {
    res.json({ message: "Welcome to api" });
}));
app.get("/test", (0, express_async_handler_1.default)(async (req, res, next) => {
    res.json({ message: "Test route" });
}));
app.all("*path", errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
app.use((err, req, res, next) => {
    res.status(500).json({
        status: globalVariables_1.messageOptions.error,
        message: err.message || "Internal Server Error",
    });
});
mongoose_1.default.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connected to MongoDB");
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
