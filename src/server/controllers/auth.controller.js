import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authController = {
  cadastrar: asyncHandler(async (req, res) => {
    res.status(201).json(await authService.cadastrar(req.body));
  }),

  login: asyncHandler(async (req, res) => {
    res.json(await authService.login(req.body));
  }),

  // RF03 — JWT é stateless: o logout efetivo é o cliente descartar o token
  logout: (_req, res) => res.status(204).end(),
};
