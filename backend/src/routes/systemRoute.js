import express from "express";
import systemController from "../controllers/systemController.js";

const router = express.Router();

router.get("/settings/public", systemController.getPublicSettings);

export default router;
