import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { usuariosRepository } from "../repositories/usuarios.repository.js";
import { pacientesRepository } from "../repositories/pacientes.repository.js";
import { usuariosService } from "./usuarios.service.js";
import { pacientesService } from "./pacientes.service.js";
import { AppError } from "../utils/AppError.js";

// RF01 — cadastro de paciente (cria usuário "paciente" + perfil de paciente)
async function cadastrar({ nome, email, senha, telefone, dataNascimento, cpf }) {
  // valida os dados do perfil antes de criar qualquer coisa
  const perfil = pacientesService.prepararDados({ telefone, dataNascimento, cpf });

  // o tipo é sempre "paciente": ninguém vira admin pelo cadastro público
  const usuario = await usuariosService.criar({ nome, email, senha, tipo: "paciente" });

  try {
    await pacientesRepository.criar({ usuarioId: usuario.id, ...perfil });
  } catch (erro) {
    await usuariosRepository.remover(usuario.id); // desfaz (ex.: CPF duplicado)
    throw erro;
  }
  return usuario;
}

// RF02 — login
async function login({ email, senha }) {
  const usuario =
    typeof email === "string"
      ? await usuariosRepository.buscarPorEmail(email.trim().toLowerCase())
      : null;
  const ok = usuario && typeof senha === "string" && (await bcrypt.compare(senha, usuario.senha));
  if (!ok) throw new AppError("E-mail ou senha incorretos", 401);

  const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
  };
}

export const authService = { cadastrar, login };
