"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vacation_controller_1 = require("../controllers/vacation.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const vacationValidation_1 = require("../validations/vacationValidation");
const validateWithJoi_1 = __importDefault(require("../utils/validateWithJoi"));
const vacationRouter = express_1.default.Router();
// Create vacation request
vacationRouter
    .post("/vacation/create-vacation", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("admin", "employee"), (0, validateWithJoi_1.default)({ body: vacationValidation_1.createVacationSchema }), vacation_controller_1.createVacationController)
    // Get vacations (with filters)
    .get("/vacation/get-vacations", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("admin", "employee", "viewer"), (0, validateWithJoi_1.default)({ query: vacationValidation_1.getVacationsSchema }), vacation_controller_1.getVacationsController)
    // Approve/Reject vacation
    .patch("/vacation/approve-and-reject/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("admin"), (0, validateWithJoi_1.default)({ body: vacationValidation_1.approveRejectVacationSchema }), vacation_controller_1.approveRejectVacationController)
    // Edit vacation date
    .patch("/vacation/edit-vacation/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorize)("admin"), (0, validateWithJoi_1.default)({ body: vacationValidation_1.editVacationDateSchema }), vacation_controller_1.editVacationDateController);
exports.default = vacationRouter;
