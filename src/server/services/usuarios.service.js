import bcrypt from "bcryptjs";
import { usuariosRepository } from "../repositories/usuarios.repository.js";
import { AppError } from "../utils/AppError.js";
import { EMAIL_RE, obrigatorio } from "../utils/validadores.js";

export const TIPOS_USUARIO = ["admin", "paciente"];
const SALT_ROUNDS = 10;

function normalizarEmail(email) {
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    throw new AppError("E-mail inválido");
  }
  return email.trim().toLowerCase();
}

function validarSenha(senha) {
  if (typeof senha !== "string" || senha.length < 8) {
    throw new AppError("A senha deve ter ao menos 8 caracteres");
  }
}

async function listar() {
  return usuariosRepository.listar();
}

async function buscar(id) {
  const usuario = await usuariosRepository.buscarPorId(id);
  if (!usuario) throw new AppError("Usuário não encontrado", 404);
  return usuario;
}

async function criar({ nome, email, senha, tipo = "paciente" }) {
  obrigatorio(nome, "nome");
  const emailNormalizado = normalizarEmail(email);
  validarSenha(senha);
  if (!TIPOS_USUARIO.includes(tipo)) {
    throw new AppError(`tipo deve ser: ${TIPOS_USUARIO.join(" | ")}`);
  }
  if (await usuariosRepository.buscarPorEmail(emailNormalizado)) {
    throw new AppError("E-mail já cadastrado", 409);
  }
  const hash = await bcrypt.hash(senha, SALT_ROUNDS);
  return usuariosRepository.criar({
    nome: nome.trim(),
    email: emailNormalizado,
    senha: hash,
    tipo,
  });
}

// admin = true permite alterar o "tipo" (perfil de acesso)
async function atualizar(id, dados = {}, { admin = false } = {}) {
  await buscar(id);
  const patch = {};

  if (dados.nome !== undefined) {
    obrigatorio(dados.nome, "nome");
    patch.nome = dados.nome.trim();
  }
  if (dados.email !== undefined) {
    patch.email = normalizarEmail(dados.email);
    const existente = await usuariosRepository.buscarPorEmail(patch.email);
    if (existente && existente.id !== id) throw new AppError("E-mail já cadastrado", 409);
  }
  if (dados.senha !== undefined) {
    validarSenha(dados.senha);
    patch.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS);
  }
  if (dados.tipo !== undefined) {
    if (!admin) throw new AppError("Sem permissão para alterar o tipo de usuário", 403);
    if (!TIPOS_USUARIO.includes(dados.tipo)) {
      throw new AppError(`tipo deve ser: ${TIPOS_USUARIO.join(" | ")}`);
    }
    patch.tipo = dados.tipo;
  }
  if (Object.keys(patch).length === 0) throw new AppError("Nenhum campo para atualizar");

  return usuariosRepository.atualizar(id, patch);
}

async function remover(id, solicitanteId) {
  if (id === solicitanteId) throw new AppError("Você não pode excluir a própria conta", 400);
  const removido = await usuariosRepository.remover(id);
  if (!removido) throw new AppError("Usuário não encontrado", 404);
}

export const usuariosService = { listar, buscar, criar, atualizar, remover };
