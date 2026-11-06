import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

// Exige "Authorization: Bearer <token>" e preenche req.usuario = { id, tipo }
export function autenticar(req, _res, next) {
  const [esquema, token] = (req.headers.authorization || "").split(" ");
  if (esquema !== "Bearer" || !token) {
    return next(new AppError("Autenticação necessária", 401));
  }
  try {
    const { id, tipo } = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id, tipo };
    next();
  } catch {
    next(new AppError("Token inválido ou expirado", 401));
  }
}

// Controle de acesso por perfil: autorizar("admin"), autorizar("paciente"), ...
export const autorizar = (...tipos) => (req, _res, next) =>
  tipos.includes(req.usuario?.tipo)
    ? next()
    : next(new AppError("Acesso negado", 403));
