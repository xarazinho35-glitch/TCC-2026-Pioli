import { Router } from "express";
import { agendamentosController as c } from "../controllers/agendamentos.controller.js";
import { autenticar, autorizar } from "../middlewares/auth.js";

const router = Router();
router.use(autenticar);

// Paciente
router.post("/", autorizar("paciente"), c.criar); // RF04/RF05/RF07
router.get("/meus", autorizar("paciente"), c.listarMeus); // RF08 (antes de "/:id")

// Administrador
router.get("/", autorizar("admin"), c.listar); // RF10 (?status=pendente)
router.put("/:id", autorizar("admin"), c.atualizar);
router.patch("/:id/status", autorizar("admin"), c.atualizarStatus); // RF11
router.delete("/:id", autorizar("admin"), c.remover);

// Paciente (dono) ou administrador — o service confere a posse (RN03)
router.get("/:id", c.buscar);
router.patch("/:id/cancelar", c.cancelar);

export default router;
