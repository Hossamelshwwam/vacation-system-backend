import express from "express";
import {
  createVacationController,
  getVacationsController,
  approveVacationController,
  rejectVacationController,
  editVacationDateController,
} from "../controllers/vacation.controller";
import { protect, authorize } from "../middleware/authMiddleware";
import {
  createVacationSchema,
  getVacationsSchema,
  approveRejectVacationSchema,
  editVacationDateSchema,
} from "../validations/vacationValidation";
import validateWithJoi from "../utils/validateWithJoi";

const vacationRouter = express.Router();

// Create vacation request
vacationRouter
  .post(
    "/vacation/create-vacation",
    protect,
    authorize("admin", "employee"),
    validateWithJoi({ body: createVacationSchema }),
    createVacationController
  )

  // Get vacations (with filters)
  .get(
    "/vacation/get-vacations",
    protect,
    authorize("admin", "employee", "viewer"),
    validateWithJoi({ query: getVacationsSchema }),
    getVacationsController
  )

  // Approve vacation
  .patch(
    "/vacation/approve-vacation/:id",
    protect,
    authorize("admin"),
    validateWithJoi({ body: approveRejectVacationSchema }),
    approveVacationController
  )

  // Approve vacation
  .patch(
    "/vacation/reject-vacation/:id",
    protect,
    authorize("admin"),
    validateWithJoi({ body: approveRejectVacationSchema }),
    rejectVacationController
  )

  // Edit vacation date
  .patch(
    "/vacation/edit-vacation/:id",
    protect,
    authorize("admin"),
    validateWithJoi({ body: editVacationDateSchema }),
    editVacationDateController
  );

export default vacationRouter;
