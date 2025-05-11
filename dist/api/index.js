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
const authRoutes_1 = __importDefault(require("../routes/authRoutes"));
const leaveRoutes_1 = __importDefault(require("../routes/leaveRoutes"));
const globalVariables_1 = require("../utils/globalVariables");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const port = process.env.API_PORT || 5173;
app.use("/api", authRoutes_1.default);
app.use("/api", leaveRoutes_1.default);
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
