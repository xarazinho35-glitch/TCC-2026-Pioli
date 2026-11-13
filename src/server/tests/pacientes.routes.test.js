import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mocks dos módulos dependentes (usando unstable_mockModule para ES Modules no Jest)
jest.unstable_mockModule("../services/pacientes.service.js", () => ({
  pacientesService: {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    meuPerfil: jest.fn(),
    criarMeuPerfil: jest.fn(),
    atualizarMeuPerfil: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  },
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  autenticar: jest.fn((req, res, next) => {
    const perfil = req.headers["x-test-perfil"];
    if (!perfil) {
      return res.status(401).json({ erro: "Não autenticado" });
    }
    req.usuario = { id: Number(req.headers["x-test-user-id"] || 1), perfil };
    next();
  }),
  autorizar: (...perfisPermitidos) => (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario?.perfil)) {
      return res.status(403).json({ erro: "Acesso negado" });
    }
    next();
  },
}));

jest.unstable_mockModule("../utils/validadores.js", () => ({
  parseId: jest.fn((id) => {
    const num = Number(id);
    if (Number.isNaN(num) || num <= 0) {
      const err = new Error("ID inválido");
      err.status = 400;
      throw err;
    }
    return num;
  }),
}));

// Importações dinâmicas obrigatórias após definir unstable_mockModule
const { default: pacientesRouter } = await import("../routes/pacientes.routes.js");
const { pacientesService } = await import("../services/pacientes.service.js");

// Configuração isolada do app Express para os testes
const app = express();
app.use(express.json());
app.use("/pacientes", pacientesRouter);

// Middleware global de tratamento de erros para simular o comportamento real da API
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ erro: err.message });
});

describe("Rotas de Pacientes (/pacientes)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // AUTENTICAÇÃO GERAL
  // =========================================================================
  describe("Autenticação", () => {
    it("deve retornar 401 se o usuário não estiver autenticado", async () => {
      const res = await request(app).get("/pacientes/me");
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // ÁREA DO PACIENTE (/me - RN03)
  // =========================================================================
  describe("GET /pacientes/me (Paciente)", () => {
    it("deve retornar o perfil do próprio paciente autenticado (200)", async () => {
      const perfilMock = { id: 10, usuarioId: 4, nome: "João Santos", cpf: "12345678900" };
      pacientesService.meuPerfil.mockResolvedValue(perfilMock);

      const res = await request(app)
        .get("/pacientes/me")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "4");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(perfilMock);
      expect(pacientesService.meuPerfil).toHaveBeenCalledWith(4);
      // Garante que não caiu na rota "/:id"
      expect(pacientesService.buscarPorId).not.toHaveBeenCalled();
    });

    it("deve bloquear acesso de admin na rota /me (403)", async () => {
      const res = await request(app)
        .get("/pacientes/me")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(403);
    });
  });

  describe("POST /pacientes/me (Paciente)", () => {
    it("deve criar o perfil do paciente autenticado e retornar 201", async () => {
      const payload = { nome: "João Santos", telefone: "34999999999", dataNascimento: "1995-05-10" };
      const retornoMock = { id: 10, usuarioId: 4, ...payload };
      pacientesService.criarMeuPerfil.mockResolvedValue(retornoMock);

      const res = await request(app)
        .post("/pacientes/me")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "4")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(retornoMock);
      expect(pacientesService.criarMeuPerfil).toHaveBeenCalledWith(4, payload);
    });

    it("deve bloquear acesso de admin (403)", async () => {
      const res = await request(app)
        .post("/pacientes/me")
        .set("x-test-perfil", "admin")
        .send({ nome: "Teste" });

      expect(res.status).toBe(403);
      expect(pacientesService.criarMeuPerfil).not.toHaveBeenCalled();
    });
  });

  describe("PUT /pacientes/me (Paciente)", () => {
    it("deve atualizar o perfil do paciente autenticado (200)", async () => {
      const dadosAtualizados = { telefone: "34988887777" };
      const retornoMock = { id: 10, usuarioId: 4, telefone: "34988887777" };
      pacientesService.atualizarMeuPerfil.mockResolvedValue(retornoMock);

      const res = await request(app)
        .put("/pacientes/me")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "4")
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(retornoMock);
      expect(pacientesService.atualizarMeuPerfil).toHaveBeenCalledWith(4, dadosAtualizados);
    });

    it("deve bloquear acesso de admin (403)", async () => {
      const res = await request(app)
        .put("/pacientes/me")
        .set("x-test-perfil", "admin")
        .send({ telefone: "34988887777" });

      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // PAINEL ADMINISTRATIVO
  // =========================================================================
  describe("GET /pacientes (Admin)", () => {
    it("deve listar todos os pacientes para o admin (200)", async () => {
      const listaMock = [{ id: 1, nome: "Ana" }, { id: 2, nome: "Carlos" }];
      pacientesService.listar.mockResolvedValue(listaMock);

      const res = await request(app)
        .get("/pacientes")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(listaMock);
      expect(pacientesService.listar).toHaveBeenCalledTimes(1);
    });

    it("deve retornar 403 se um paciente tentar listar todos os pacientes", async () => {
      const res = await request(app)
        .get("/pacientes")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });

  describe("GET /pacientes/:id (Admin)", () => {
    it("deve buscar um paciente específico por ID (200)", async () => {
      const pacienteMock = { id: 15, nome: "Carlos" };
      pacientesService.buscarPorId.mockResolvedValue(pacienteMock);

      const res = await request(app)
        .get("/pacientes/15")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(pacienteMock);
      expect(pacientesService.buscarPorId).toHaveBeenCalledWith(15);
    });

    it("deve retornar 400 se o ID for inválido", async () => {
      const res = await request(app)
        .get("/pacientes/invalido")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(400);
      expect(pacientesService.buscarPorId).not.toHaveBeenCalled();
    });

    it("deve retornar 403 se um paciente tentar buscar outro perfil por ID", async () => {
      const res = await request(app)
        .get("/pacientes/15")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /pacientes/:id (Admin)", () => {
    it("deve atualizar um paciente por ID (200)", async () => {
      const dadosAtualizados = { nome: "Carlos Alberto" };
      const retornoMock = { id: 15, nome: "Carlos Alberto" };
      pacientesService.atualizar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .put("/pacientes/15")
        .set("x-test-perfil", "admin")
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(retornoMock);
      expect(pacientesService.atualizar).toHaveBeenCalledWith(15, dadosAtualizados);
    });

    it("deve retornar 400 ao passar ID inválido", async () => {
      const res = await request(app)
        .put("/pacientes/0")
        .set("x-test-perfil", "admin")
        .send({ nome: "Teste" });

      expect(res.status).toBe(400);
      expect(pacientesService.atualizar).not.toHaveBeenCalled();
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .put("/pacientes/15")
        .set("x-test-perfil", "paciente")
        .send({ nome: "Carlos Alberto" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /pacientes/:id (Admin)", () => {
    it("deve remover um paciente e retornar status 204 sem corpo", async () => {
      pacientesService.remover.mockResolvedValue();

      const res = await request(app)
        .delete("/pacientes/15")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(204);
      expect(res.text).toBe("");
      expect(pacientesService.remover).toHaveBeenCalledWith(15);
    });

    it("deve retornar 400 ao passar ID inválido", async () => {
      const res = await request(app)
        .delete("/pacientes/abc")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(400);
      expect(pacientesService.remover).not.toHaveBeenCalled();
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .delete("/pacientes/15")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });
});
