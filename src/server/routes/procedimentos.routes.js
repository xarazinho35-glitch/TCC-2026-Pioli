import { Router } from "express";
import { procedimentosController as c } from "../controllers/procedimentos.controller.js";
import { autenticar, autorizar } from "../middlewares/auth.js";

const router = Router();

// Público: visitantes veem os serviços da clínica
router.get("/", c.listar);
router.get("/:id", c.buscar);

// Somente administrador
router.post("/", autenticar, autorizar("admin"), c.criar);
router.put("/:id", autenticar, autorizar("admin"), c.atualizar);
router.delete("/:id", autenticar, autorizar("admin"), c.remover);

export default router;
