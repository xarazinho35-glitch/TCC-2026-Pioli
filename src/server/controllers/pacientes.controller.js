import { pacientesService } from "../services/pacientes.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/validadores.js";

export const pacientesController = {
  listar: asyncHandler(async (_req, res) => {
    res.json(await pacientesService.listar());
  }),

  buscar: asyncHandler(async (req, res) => {
    res.json(await pacientesService.buscarPorId(parseId(req.params.id)));
  }),

  meuPerfil: asyncHandler(async (req, res) => {
    res.json(await pacientesService.meuPerfil(req.usuario.id));
  }),

  criarMeuPerfil: asyncHandler(async (req, res) => {
    res.status(201).json(await pacientesService.criarMeuPerfil(req.usuario.id, req.body));
  }),

  atualizarMeuPerfil: asyncHandler(async (req, res) => {
    res.json(await pacientesService.atualizarMeuPerfil(req.usuario.id, req.body));
  }),

  atualizar: asyncHandler(async (req, res) => {
    res.json(await pacientesService.atualizar(parseId(req.params.id), req.body));
  }),

  remover: asyncHandler(async (req, res) => {
    await pacientesService.remover(parseId(req.params.id));
    res.status(204).end();
  }),
};
