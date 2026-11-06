import { agendamentosService } from "../services/agendamentos.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/validadores.js";

export const agendamentosController = {
  // paciente -> { agendamento, whatsappUrl }
  criar: asyncHandler(async (req, res) => {
    res.status(201).json(await agendamentosService.criar(req.usuario, req.body));
  }),

  listar: asyncHandler(async (req, res) => {
    res.json(await agendamentosService.listar({ status: req.query.status }));
  }),

  listarMeus: asyncHandler(async (req, res) => {
    res.json(await agendamentosService.listarMeus(req.usuario, { status: req.query.status }));
  }),

  buscar: asyncHandler(async (req, res) => {
    res.json(await agendamentosService.buscar(parseId(req.params.id), req.usuario));
  }),

  atualizar: asyncHandler(async (req, res) => {
    res.json(await agendamentosService.atualizar(parseId(req.params.id), req.body));
  }),

  atualizarStatus: asyncHandler(async (req, res) => {
    res.json(await agendamentosService.atualizarStatus(parseId(req.params.id), req.body?.status));
  }),

  cancelar: asyncHandler(async (req, res) => {
    res.json(await agendamentosService.cancelar(parseId(req.params.id), req.usuario));
  }),

  remover: asyncHandler(async (req, res) => {
    await agendamentosService.remover(parseId(req.params.id));
    res.status(204).end();
  }),
};
