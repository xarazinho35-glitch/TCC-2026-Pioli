import { procedimentosService } from "../services/procedimentos.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/validadores.js";

export const procedimentosController = {
  listar: asyncHandler(async (_req, res) => {
    res.json(await procedimentosService.listar());
  }),

  buscar: asyncHandler(async (req, res) => {
    res.json(await procedimentosService.buscar(parseId(req.params.id)));
  }),

  criar: asyncHandler(async (req, res) => {
    res.status(201).json(await procedimentosService.criar(req.body));
  }),

  atualizar: asyncHandler(async (req, res) => {
    res.json(await procedimentosService.atualizar(parseId(req.params.id), req.body));
  }),

  remover: asyncHandler(async (req, res) => {
    await procedimentosService.remover(parseId(req.params.id));
    res.status(204).end();
  }),
};
