import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mocks dos módulos dependentes (usando unstable_mockModule para ES Modules no Jest)
jest.unstable_mockModule("../services/usuarios.service.js", () => ({
  usuariosService: {
    listar: jest.fn(),
    buscar: jest.fn(),
    criar: jest.fn(),
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
const { default: usuariosRouter } = await import("../routes/usuarios.routes.js");
const { usuariosService } = await import("../services/usuarios.service.js");

// Configuração isolada do app Express para os testes
const app = express();
app.use(express.json());
app.use("/usuarios", usuariosRouter);

// Middleware global de tratamento de erros para simular o comportamento real da API
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ erro: err.message });
});

describe("Rotas de Usuários (/usuarios)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // AUTENTICAÇÃO GERAL
  // =========================================================================
  describe("Autenticação", () => {
    it("deve retornar 401 se o usuário não estiver autenticado", async () => {
      const res = await request(app).get("/usuarios/me");
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // PRÓPRIA CONTA (/me - Qualquer usuário logado)
  // =========================================================================
  describe("GET /usuarios/me (Autenticado)", () => {
    it("deve retornar os dados do próprio usuário logado (paciente ou admin)", async () => {
      const usuarioMock = { id: 7, nome: "Lucas", email: "lucas@email.com", perfil: "paciente" };
      usuariosService.buscar.mockResolvedValue(usuarioMock);

      const res = await request(app)
        .get("/usuarios/me")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "7");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(usuarioMock);
      expect(usuariosService.buscar).toHaveBeenCalledWith(7);
    });
  });

  describe("PUT /usuarios/me (Autenticado)", () => {
    it("deve atualizar a própria conta passando { admin: false } ao service", async () => {
      const payload = { nome: "Lucas Oliveira" };
      const retornoMock = { id: 7, nome: "Lucas Oliveira", perfil: "paciente" };
      usuariosService.atualizar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .put("/usuarios/me")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "7")
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(retornoMock);
      expect(usuariosService.atualizar).toHaveBeenCalledWith(7, payload, { admin: false });
    });
  });

  // =========================================================================
  // PAINEL ADMINISTRATIVO (Somente Admin - RN02 / RF12)
  // =========================================================================
  describe("GET /usuarios (Admin)", () => {
    it("deve listar todos os usuários para o admin (200)", async () => {
      const listaMock = [
        { id: 1, nome: "Admin", perfil: "admin" },
        { id: 2, nome: "Paciente", perfil: "paciente" },
      ];
      usuariosService.listar.mockResolvedValue(listaMock);

      const res = await request(app)
        .get("/usuarios")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(listaMock);
      expect(usuariosService.listar).toHaveBeenCalledTimes(1);
    });

    it("deve retornar 403 para usuário não-admin", async () => {
      const res = await request(app)
        .get("/usuarios")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });

  describe("POST /usuarios (Admin)", () => {
    it("deve criar um novo usuário pelo painel admin e retornar 201", async () => {
      const novoUsuario = { nome: "Novo Admin", email: "novo@clinica.com", perfil: "admin" };
      const retornoMock = { id: 10, ...novoUsuario };
      usuariosService.criar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .post("/usuarios")
        .set("x-test-perfil", "admin")
        .send(novoUsuario);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(retornoMock);
      expect(usuariosService.criar).toHaveBeenCalledWith(novoUsuario);
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .post("/usuarios")
        .set("x-test-perfil", "paciente")
        .send({ nome: "Teste" });

      expect(res.status).toBe(403);
      expect(usuariosService.criar).not.toHaveBeenCalled();
    });
  });

  describe("GET /usuarios/:id (Admin)", () => {
    it("deve buscar um usuário específico por ID para o admin (200)", async () => {
      const usuarioMock = { id: 5, nome: "Fernanda" };
      usuariosService.buscar.mockResolvedValue(usuarioMock);

      const res = await request(app)
        .get("/usuarios/5")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(usuarioMock);
      expect(usuariosService.buscar).toHaveBeenCalledWith(5);
    });

    it("deve retornar 400 se o ID for inválido", async () => {
      const res = await request(app)
        .get("/usuarios/abc")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(400);
      expect(usuariosService.buscar).not.toHaveBeenCalled();
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .get("/usuarios/5")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /usuarios/:id (Admin)", () => {
    it("deve atualizar um usuário passando { admin: true } ao service (200)", async () => {
      const dadosAtualizados = { perfil: "admin" };
      const retornoMock = { id: 5, nome: "Fernanda", perfil: "admin" };
      usuariosService.atualizar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .put("/usuarios/5")
        .set("x-test-perfil", "admin")
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(retornoMock);
      expect(usuariosService.atualizar).toHaveBeenCalledWith(5, dadosAtualizados, { admin: true });
    });

    it("deve retornar 400 ao passar ID inválido", async () => {
      const res = await request(app)
        .put("/usuarios/0")
        .set("x-test-perfil", "admin")
        .send({ nome: "Teste" });

      expect(res.status).toBe(400);
      expect(usuariosService.atualizar).not.toHaveBeenCalled();
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .put("/usuarios/5")
        .set("x-test-perfil", "paciente")
        .send({ perfil: "admin" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /usuarios/:id (Admin)", () => {
    it("deve remover um usuário repassando o ID alvo e o ID do admin logado (204)", async () => {
      usuariosService.remover.mockResolvedValue();

      const res = await request(app)
        .delete("/usuarios/5")
        .set("x-test-perfil", "admin")
        .set("x-test-user-id", "1");

      expect(res.status).toBe(204);
      expect(res.text).toBe("");
      expect(usuariosService.remover).toHaveBeenCalledWith(5, 1);
    });

    it("deve retornar 400 ao passar ID inválido", async () => {
      const res = await request(app)
        .delete("/usuarios/invalido")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(400);
      expect(usuariosService.remover).not.toHaveBeenCalled();
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .delete("/usuarios/5")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });
});
