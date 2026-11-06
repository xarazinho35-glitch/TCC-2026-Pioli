import { usuariosService } from "../services/usuarios.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/validadores.js";

export const usuariosController = {
  listar: asyncHandler(async (_req, res) => {
    res.json(await usuariosService.listar());
  }),

  buscar: asyncHandler(async (req, res) => {
    res.json(await usuariosService.buscar(parseId(req.params.id)));
  }),

  eu: asyncHandler(async (req, res) => {
    res.json(await usuariosService.buscar(req.usuario.id));
  }),

  criar: asyncHandler(async (req, res) => {
    res.status(201).json(await usuariosService.criar(req.body));
  }),

  atualizarEu: asyncHandler(async (req, res) => {
    res.json(await usuariosService.atualizar(req.usuario.id, req.body, { admin: false }));
  }),

  atualizar: asyncHandler(async (req, res) => {
    res.json(await usuariosService.atualizar(parseId(req.params.id), req.body, { admin: true }));
  }),

  remover: asyncHandler(async (req, res) => {
    await usuariosService.remover(parseId(req.params.id), req.usuario.id);
    res.status(204).end();
  }),
};
