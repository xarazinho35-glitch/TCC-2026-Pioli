import { Router } from "express";
import { usuariosController as c } from "../controllers/usuarios.controller.js";
import { autenticar, autorizar } from "../middlewares/auth.js";

const router = Router();
router.use(autenticar);

// Qualquer usuário logado: a própria conta (declarar antes de "/:id")
router.get("/me", c.eu);
router.put("/me", c.atualizarEu);

// Somente administrador (RN02 / RF12)
router.get("/", autorizar("admin"), c.listar);
router.post("/", autorizar("admin"), c.criar);
router.get("/:id", autorizar("admin"), c.buscar);
router.put("/:id", autorizar("admin"), c.atualizar);
router.delete("/:id", autorizar("admin"), c.remover);

export default router;
