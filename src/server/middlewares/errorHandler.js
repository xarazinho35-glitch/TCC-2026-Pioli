import { AppError } from "../utils/AppError.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }

  // Erros do Postgres (o Drizzle pode embrulhar o erro original em err.cause)
  const code = err.code ?? err.cause?.code;
  const constraint = err.constraint ?? err.cause?.constraint;

  if (code === "23505") {
    const erro =
      constraint === "uq_agendamentos_data_horario"
        ? "Já existe um agendamento nesse dia e horário"
        : "Registro duplicado: valor já cadastrado";
    return res.status(409).json({ erro });
  }
  if (code === "23503") {
    return res.status(409).json({
      erro: "Operação não permitida: referência inválida ou existem registros vinculados",
    });
  }

  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
}
