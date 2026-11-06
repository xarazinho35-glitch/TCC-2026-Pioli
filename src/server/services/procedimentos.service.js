import { procedimentosRepository } from "../repositories/procedimentos.repository.js";
import { AppError } from "../utils/AppError.js";
import { obrigatorio } from "../utils/validadores.js";

function prepararDados(dados = {}, { completo = false } = {}) {
  const out = {};

  if (completo || dados.nome !== undefined) {
    obrigatorio(dados.nome, "nome");
    out.nome = String(dados.nome).trim();
  }
  if (dados.descricao !== undefined) {
    out.descricao = dados.descricao === null ? null : String(dados.descricao).trim();
  }
  if (dados.duracao !== undefined) {
    const duracao = Number(dados.duracao);
    if (!Number.isInteger(duracao) || duracao <= 0) {
      throw new AppError("duracao deve ser um inteiro positivo (minutos)");
    }
    out.duracao = duracao;
  }
  if (dados.preco !== undefined) {
    const preco = Number(dados.preco);
    if (!Number.isFinite(preco) || preco < 0) throw new AppError("preco inválido");
    out.preco = preco.toFixed(2); // coluna numeric -> string
  }

  for (const campo of ["nome", "descricao"]) {
    if (out[campo] && out[campo].length > 255) {
      throw new AppError(`${campo} deve ter no máximo 255 caracteres`);
    }
  }
  return out;
}

async function listar() {
  return procedimentosRepository.listar();
}

async function buscar(id) {
  const procedimento = await procedimentosRepository.buscarPorId(id);
  if (!procedimento) throw new AppError("Procedimento não encontrado", 404);
  return procedimento;
}

async function criar(dados) {
  return procedimentosRepository.criar(prepararDados(dados, { completo: true }));
}

async function atualizar(id, dados) {
  await buscar(id);
  const patch = prepararDados(dados);
  if (Object.keys(patch).length === 0) throw new AppError("Nenhum campo para atualizar");
  return procedimentosRepository.atualizar(id, patch);
}

// FK com onDelete "restrict": se houver agendamentos, o banco recusa (23505/23503 -> 409)
async function remover(id) {
  const removido = await procedimentosRepository.remover(id);
  if (!removido) throw new AppError("Procedimento não encontrado", 404);
}

export const procedimentosService = { listar, buscar, criar, atualizar, remover };
