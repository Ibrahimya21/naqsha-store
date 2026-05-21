import express from "express";
import {
  getAllUsersForAdmin,
  getUserByIdForAdmin,
  updateUserRoleForAdmin,
  toggleUserStatusForAdmin,
  changeMyPassword,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.use(protect);
router.patch("/me/password", changeMyPassword);
router.use(requireAdmin);

router.get("/", getAllUsersForAdmin);
router.get("/:userId", getUserByIdForAdmin);
router.patch("/:userId/role", updateUserRoleForAdmin);
router.patch("/:userId/toggle-status", toggleUserStatusForAdmin);


export default router;
