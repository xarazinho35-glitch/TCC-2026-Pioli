import { Router } from "express";
import { pacientesController as c } from "../controllers/pacientes.controller.js";
import { autenticar, autorizar } from "../middlewares/auth.js";

const router = Router();
router.use(autenticar);

// Área do paciente: só o próprio perfil (RN03) — antes de "/:id"
router.get("/me", autorizar("paciente"), c.meuPerfil);
router.post("/me", autorizar("paciente"), c.criarMeuPerfil);
router.put("/me", autorizar("paciente"), c.atualizarMeuPerfil);

// Painel administrativo
router.get("/", autorizar("admin"), c.listar);
router.get("/:id", autorizar("admin"), c.buscar);
router.put("/:id", autorizar("admin"), c.atualizar);
router.delete("/:id", autorizar("admin"), c.remover);

export default router;
