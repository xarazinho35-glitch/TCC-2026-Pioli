import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mocks dos módulos dependentes (usando unstable_mockModule para ES Modules no Jest)
jest.unstable_mockModule("../services/auth.service.js", () => ({
  authService: {
    cadastrar: jest.fn(),
    login: jest.fn(),
  },
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  autenticar: jest.fn((req, res, next) => {
    // Simula a validação do token JWT via header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ erro: "Token não fornecido ou inválido" });
    }
    req.usuario = { id: 1, perfil: "paciente" };
    next();
  }),
}));

// Importações dinâmicas obrigatórias após definir unstable_mockModule
const { default: authRouter } = await import("../routes/auth.routes.js");
const { authService } = await import("../services/auth.service.js");

// Configuração isolada do app Express para os testes
const app = express();
app.use(express.json());
app.use("/auth", authRouter);

// Middleware global de tratamento de erros para simular o comportamento real da API
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ erro: err.message });
});

describe("Rotas de Autenticação (/auth)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // CADASTRO (RF01 - Público)
  // =========================================================================
  describe("POST /auth/cadastro", () => {
    it("deve cadastrar um novo usuário e retornar status 201", async () => {
      const novoUsuario = {
        nome: "Maria Silva",
        email: "maria@email.com",
        senha: "SenhaForte123!",
        telefone: "34999999999",
      };
      const retornoMock = {
        id: 1,
        nome: "Maria Silva",
        email: "maria@email.com",
        perfil: "paciente",
      };
      authService.cadastrar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .post("/auth/cadastro")
        .send(novoUsuario);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(retornoMock);
      expect(authService.cadastrar).toHaveBeenCalledWith(novoUsuario);
    });

    it("deve repassar erro de validação ou conflito (ex: 400/409) vindo do service", async () => {
      const erroConflito = new Error("E-mail já cadastrado");
      erroConflito.status = 409;
      authService.cadastrar.mockRejectedValue(erroConflito);

      const res = await request(app)
        .post("/auth/cadastro")
        .send({ email: "existente@email.com" });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ erro: "E-mail já cadastrado" });
    });
  });

  // =========================================================================
  // LOGIN (RF02 - Público)
  // =========================================================================
  describe("POST /auth/login", () => {
    it("deve autenticar o usuário e retornar o token (200)", async () => {
      const credenciais = {
        email: "maria@email.com",
        senha: "SenhaForte123!",
      };
      const retornoMock = {
        token: "jwt.token.gerado",
        usuario: { id: 1, nome: "Maria Silva", perfil: "paciente" },
      };
      authService.login.mockResolvedValue(retornoMock);

      const res = await request(app)
        .post("/auth/login")
        .send(credenciais);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(retornoMock);
      expect(authService.login).toHaveBeenCalledWith(credenciais);
    });

    it("deve retornar 401 quando as credenciais forem inválidas", async () => {
      const erroAuth = new Error("E-mail ou senha inválidos");
      erroAuth.status = 401;
      authService.login.mockRejectedValue(erroAuth);

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "maria@email.com", senha: "errada" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ erro: "E-mail ou senha inválidos" });
    });
  });

  // =========================================================================
  // LOGOUT (RF03 - Autenticado)
  // =========================================================================
  describe("POST /auth/logout", () => {
    it("deve retornar status 204 sem corpo quando o usuário estiver autenticado", async () => {
      const res = await request(app)
        .post("/auth/logout")
        .set("Authorization", "Bearer token-valido-123");

      expect(res.status).toBe(204);
      expect(res.text).toBe("");
    });

    it("deve retornar 401 se tentar fazer logout sem estar autenticado", async () => {
      const res = await request(app).post("/auth/logout");

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ erro: "Token não fornecido ou inválido" });
    });
  });
});
