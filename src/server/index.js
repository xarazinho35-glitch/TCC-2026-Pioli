import "dotenv/config"; // carrega o .env (JWT_SECRET, CLINICA_WHATSAPP, ...)
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./utils/AppError.js";
 
const app = express();
 
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
 
// Rota simples para checar se a API está no ar
app.get("/health", (_req, res) => res.json({ status: "ok" }));
 
// Todas as rotas ficam sob /api
app.use("/api", routes);
 
// 404 para qualquer rota inexistente
app.use((req, _res, next) => next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404)));
 
// Tratador de erros: sempre por último
app.use(errorHandler);
 

 
export default app;
 