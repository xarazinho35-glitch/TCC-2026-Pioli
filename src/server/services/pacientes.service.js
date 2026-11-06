import { pacientesRepository } from "../repositories/pacientes.repository.js";
import { AppError } from "../utils/AppError.js";
import { dataValida, hojeBR } from "../utils/validadores.js";

// Valida e normaliza apenas os campos enviados
function prepararDados(dados = {}) {
  const out = {};

  if (dados.telefone !== undefined) {
    const telefone = String(dados.telefone).replace(/\D/g, "");
    if (telefone.length < 10 || telefone.length > 13) throw new AppError("Telefone inválido");
    out.telefone = telefone;
  }
  if (dados.dataNascimento !== undefined) {
    if (!dataValida(dados.dataNascimento)) {
      throw new AppError("dataNascimento deve estar no formato YYYY-MM-DD");
    }
    if (dados.dataNascimento > hojeBR()) {
      throw new AppError("dataNascimento não pode estar no futuro");
    }
    out.dataNascimento = dados.dataNascimento;
  }
  if (dados.cpf !== undefined) {
    const cpf = String(dados.cpf).replace(/\D/g, "");
    if (cpf.length !== 11) throw new AppError("CPF deve ter 11 dígitos");
    out.cpf = cpf;
  }
  return out;
}

async function listar() {
  return pacientesRepository.listar();
}

async function buscarPorId(id) {
  const paciente = await pacientesRepository.buscarPorId(id);
  if (!paciente) throw new AppError("Paciente não encontrado", 404);
  return paciente;
}

// RN03: o paciente só enxerga o próprio perfil
async function meuPerfil(usuarioId) {
  const paciente = await pacientesRepository.buscarPorUsuarioId(usuarioId);
  if (!paciente) throw new AppError("Perfil de paciente não encontrado", 404);
  return paciente;
}

async function criarMeuPerfil(usuarioId, dados) {
  if (await pacientesRepository.buscarPorUsuarioId(usuarioId)) {
    throw new AppError("Perfil de paciente já existe", 409);
  }
  return pacientesRepository.criar({ usuarioId, ...prepararDados(dados) });
}

async function atualizarMeuPerfil(usuarioId, dados) {
  const atual = await meuPerfil(usuarioId);
  return atualizar(atual.id, dados);
}

async function atualizar(id, dados) {
  await buscarPorId(id);
  const patch = prepararDados(dados);
  if (Object.keys(patch).length === 0) throw new AppError("Nenhum campo para atualizar");
  return pacientesRepository.atualizar(id, patch);
}

async function remover(id) {
  const removido = await pacientesRepository.remover(id);
  if (!removido) throw new AppError("Paciente não encontrado", 404);
}

export const pacientesService = {
  prepararDados,
  listar,
  buscarPorId,
  meuPerfil,
  criarMeuPerfil,
  atualizarMeuPerfil,
  atualizar,
  remover,
};
