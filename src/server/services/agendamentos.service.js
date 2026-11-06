import { agendamentosRepository } from "../repositories/agendamentos.repository.js";
import { pacientesRepository } from "../repositories/pacientes.repository.js";
import { procedimentosRepository } from "../repositories/procedimentos.repository.js";
import { AppError } from "../utils/AppError.js";
import { dataValida, horarioValido, hojeBR, parseId } from "../utils/validadores.js";

export const STATUS_AGENDAMENTO = ["pendente", "confirmado", "cancelado"];

async function pacienteDoUsuario(usuario) {
  const paciente = await pacientesRepository.buscarPorUsuarioId(usuario.id);
  if (!paciente) {
    throw new AppError("Complete seus dados de paciente antes de solicitar agendamentos", 400);
  }
  return paciente;
}

// Admin acessa qualquer agendamento; paciente apenas os próprios (RN03)
async function carregarComAcesso(id, usuario) {
  const agendamento = await agendamentosRepository.buscarPorId(id);
  if (!agendamento) throw new AppError("Agendamento não encontrado", 404);
  if (usuario.tipo !== "admin") {
    const paciente = await pacienteDoUsuario(usuario);
    if (agendamento.paciente.id !== paciente.id) {
      throw new AppError("Agendamento não encontrado", 404);
    }
  }
  return agendamento;
}

function validarStatus(status) {
  if (!STATUS_AGENDAMENTO.includes(status)) {
    throw new AppError(`status deve ser: ${STATUS_AGENDAMENTO.join(" | ")}`);
  }
}

function validarObservacoes(obs) {
  if (obs == null) return null;
  const texto = String(obs).trim();
  if (texto.length > 255) throw new AppError("observacoes deve ter no máximo 255 caracteres");
  return texto || null;
}

// RF07: link do WhatsApp da clínica com os dados da solicitação
function montarLinkWhatsApp({ agendamento, telefone }) {
  const [ano, mes, dia] = agendamento.data.split("-");
  const linhas = [
    "Olá! Gostaria de solicitar um agendamento:",
    `Nome: ${agendamento.paciente.nome}`,
    `Serviço: ${agendamento.procedimento.nome}`,
    `Data: ${dia}/${mes}/${ano}`,
    `Horário: ${agendamento.horario.slice(0, 5)}`,
    telefone && `Telefone: ${telefone}`,
    agendamento.observacoes && `Observações: ${agendamento.observacoes}`,
  ].filter(Boolean);

  return `https://wa.me/${process.env.CLINICA_WHATSAPP}?text=${encodeURIComponent(linhas.join("\n"))}`;
}

// Paciente solicita agendamento -> status sempre "pendente" (RN04)
async function criar(usuario, body = {}) {
  const paciente = await pacienteDoUsuario(usuario);
  const procedimentoId = parseId(body.procedimentoId, "procedimentoId");

  if (!dataValida(body.data)) throw new AppError("data deve estar no formato YYYY-MM-DD");
  if (body.data < hojeBR()) throw new AppError("A data deve ser hoje ou futura");
  if (!horarioValido(body.horario)) throw new AppError("horario deve estar no formato HH:MM");
  const observacoes = validarObservacoes(body.observacoes);

  if (!(await procedimentosRepository.buscarPorId(procedimentoId))) {
    throw new AppError("Procedimento não encontrado", 404);
  }

  // Violação de unique (data + horário) vira 409 no errorHandler
  const agendamento = await agendamentosRepository.criar({
    pacientesId: paciente.id,
    procedimentoId,
    data: body.data,
    horario: body.horario,
    observacoes,
    status: "pendente",
  });

  const telefone = body.telefone ? String(body.telefone) : paciente.telefone;
  return { agendamento, whatsappUrl: montarLinkWhatsApp({ agendamento, telefone }) };
}

async function listar({ status } = {}) {
  if (status !== undefined) validarStatus(status);
  return agendamentosRepository.listar({ status });
}

async function listarMeus(usuario, { status } = {}) {
  if (status !== undefined) validarStatus(status);
  const paciente = await pacienteDoUsuario(usuario);
  return agendamentosRepository.listar({ status, pacienteId: paciente.id });
}

async function buscar(id, usuario) {
  return carregarComAcesso(id, usuario);
}

// Admin: remarcar / ajustar dados
async function atualizar(id, body = {}) {
  const atual = await agendamentosRepository.buscarPorId(id);
  if (!atual) throw new AppError("Agendamento não encontrado", 404);

  const patch = {};
  if (body.data !== undefined) {
    if (!dataValida(body.data)) throw new AppError("data deve estar no formato YYYY-MM-DD");
    patch.data = body.data;
  }
  if (body.horario !== undefined) {
    if (!horarioValido(body.horario)) throw new AppError("horario deve estar no formato HH:MM");
    patch.horario = body.horario;
  }
  if (body.procedimentoId !== undefined) {
    patch.procedimentoId = parseId(body.procedimentoId, "procedimentoId");
    if (!(await procedimentosRepository.buscarPorId(patch.procedimentoId))) {
      throw new AppError("Procedimento não encontrado", 404);
    }
  }
  if (body.observacoes !== undefined) patch.observacoes = validarObservacoes(body.observacoes);
  if (body.status !== undefined) {
    validarStatus(body.status);
    patch.status = body.status;
  }
  if (Object.keys(patch).length === 0) throw new AppError("Nenhum campo para atualizar");

  return agendamentosRepository.atualizar(id, patch);
}

// RF11 / RN06
async function atualizarStatus(id, status) {
  validarStatus(status);
  const atualizado = await agendamentosRepository.atualizar(id, { status });
  if (!atualizado) throw new AppError("Agendamento não encontrado", 404);
  return atualizado;
}

// Paciente (dono) ou admin
async function cancelar(id, usuario) {
  const agendamento = await carregarComAcesso(id, usuario);
  if (agendamento.status === "cancelado") throw new AppError("Agendamento já está cancelado");
  return agendamentosRepository.atualizar(id, { status: "cancelado" });
}

async function remover(id) {
  const removido = await agendamentosRepository.remover(id);
  if (!removido) throw new AppError("Agendamento não encontrado", 404);
}

export const agendamentosService = {
  criar,
  listar,
  listarMeus,
  buscar,
  atualizar,
  atualizarStatus,
  cancelar,
  remover,
};
