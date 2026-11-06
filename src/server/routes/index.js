import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import pacientesRoutes from "./pacientes.routes.js";
import procedimentosRoutes from "./procedimentos.routes.js";
import agendamentosRoutes from "./agendamentos.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/pacientes", pacientesRoutes);
router.use("/procedimentos", procedimentosRoutes);
router.use("/agendamentos", agendamentosRoutes);

export default router;
