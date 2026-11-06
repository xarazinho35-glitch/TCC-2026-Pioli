import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { autenticar } from "../middlewares/auth.js";

const router = Router();

router.post("/cadastro", authController.cadastrar); // RF01 (público)
router.post("/login", authController.login); // RF02 (público)
router.post("/logout", autenticar, authController.logout); // RF03

export default router;
