import { AppError } from "./AppError.js";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseId(valor, nome = "id") {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new AppError(`${nome} inválido`, 400);
  return n;
}

export function obrigatorio(valor, campo) {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    throw new AppError(`${campo} é obrigatório`, 400);
  }
}

// Espera 'YYYY-MM-DD' e uma data real do calendário
export function dataValida(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// Espera 'HH:MM'
export const horarioValido = (s) =>
  typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

// 'YYYY-MM-DD' de hoje no fuso de Brasília
export const hojeBR = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
