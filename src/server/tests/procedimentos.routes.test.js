import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mocks dos módulos dependentes (usando unstable_mockModule para ES Modules no Jest)
jest.unstable_mockModule("../services/procedimentos.service.js", () => ({
  procedimentosService: {
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
const { default: procedimentosRouter } = await import("../routes/procedimentos.routes.js");
const { procedimentosService } = await import("../services/procedimentos.service.js");

// Configuração isolada do app Express para os testes
const app = express();
app.use(express.json());
app.use("/procedimentos", procedimentosRouter);

// Middleware global de tratamento de erros para simular o comportamento real da API
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ erro: err.message });
});

describe("Rotas de Procedimentos (/procedimentos)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // ROTAS PÚBLICAS (Visitantes, Pacientes e Admins)
  // =========================================================================
  describe("GET /procedimentos (Público)", () => {
    it("deve listar todos os procedimentos sem exigir autenticação (200)", async () => {
      const listaMock = [
        { id: 1, nome: "Limpeza de Pele", preco: 120.0 },
        { id: 2, nome: "Drenagem Linfática", preco: 150.0 },
      ];
      procedimentosService.listar.mockResolvedValue(listaMock);

      const res = await request(app).get("/procedimentos");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(listaMock);
      expect(procedimentosService.listar).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /procedimentos/:id (Público)", () => {
    it("deve buscar um procedimento por ID sem exigir autenticação (200)", async () => {
      const procedimentoMock = { id: 3, nome: "Massagem Relaxante", duracao: 60 };
      procedimentosService.buscar.mockResolvedValue(procedimentoMock);

      const res = await request(app).get("/procedimentos/3");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(procedimentoMock);
      expect(procedimentosService.buscar).toHaveBeenCalledWith(3);
    });

    it("deve retornar 400 se o ID for inválido", async () => {
      const res = await request(app).get("/procedimentos/abc");

      expect(res.status).toBe(400);
      expect(procedimentosService.buscar).not.toHaveBeenCalled();
    });

    it("deve repassar erro 404 caso o procedimento não seja encontrado", async () => {
      const erroNotFound = new Error("Procedimento não encontrado");
      erroNotFound.status = 404;
      procedimentosService.buscar.mockRejectedValue(erroNotFound);

      const res = await request(app).get("/procedimentos/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ erro: "Procedimento não encontrado" });
    });
  });

  // =========================================================================
  // ROTAS ADMINISTRATIVAS (Somente Admin)
  // =========================================================================
  describe("POST /procedimentos (Admin)", () => {
    it("deve criar um novo procedimento para o admin e retornar 201", async () => {
      const payload = { nome: "Peeling Químico", descricao: "Renovação celular", preco: 200.0 };
      const retornoMock = { id: 5, ...payload };
      procedimentosService.criar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .post("/procedimentos")
        .set("x-test-perfil", "admin")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(retornoMock);
      expect(procedimentosService.criar).toHaveBeenCalledWith(payload);
    });

    it("deve retornar 401 se não estiver autenticado", async () => {
      const res = await request(app)
        .post("/procedimentos")
        .send({ nome: "Peeling Químico" });

      expect(res.status).toBe(401);
      expect(procedimentosService.criar).not.toHaveBeenCalled();
    });

    it("deve retornar 403 se um paciente tentar criar um procedimento", async () => {
      const res = await request(app)
        .post("/procedimentos")
        .set("x-test-perfil", "paciente")
        .send({ nome: "Peeling Químico" });

      expect(res.status).toBe(403);
      expect(procedimentosService.criar).not.toHaveBeenCalled();
    });
  });

  describe("PUT /procedimentos/:id (Admin)", () => {
    it("deve atualizar um procedimento existente para o admin (200)", async () => {
      const dadosAtualizados = { preco: 220.0 };
      const retornoMock = { id: 5, nome: "Peeling Químico", preco: 220.0 };
      procedimentosService.atualizar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .put("/procedimentos/5")
        .set("x-test-perfil", "admin")
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(retornoMock);
      expect(procedimentosService.atualizar).toHaveBeenCalledWith(5, dadosAtualizados);
    });

    it("deve retornar 400 ao passar ID inválido", async () => {
      const res = await request(app)
        .put("/procedimentos/0")
        .set("x-test-perfil", "admin")
        .send({ preco: 220.0 });

      expect(res.status).toBe(400);
      expect(procedimentosService.atualizar).not.toHaveBeenCalled();
    });

    it("deve retornar 401 se não estiver autenticado", async () => {
      const res = await request(app)
        .put("/procedimentos/5")
        .send({ preco: 220.0 });

      expect(res.status).toBe(401);
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .put("/procedimentos/5")
        .set("x-test-perfil", "paciente")
        .send({ preco: 220.0 });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /procedimentos/:id (Admin)", () => {
    it("deve remover um procedimento para o admin e retornar status 204 sem corpo", async () => {
      procedimentosService.remover.mockResolvedValue();

      const res = await request(app)
        .delete("/procedimentos/5")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(204);
      expect(res.text).toBe("");
      expect(procedimentosService.remover).toHaveBeenCalledWith(5);
    });

    it("deve retornar 400 ao passar ID inválido", async () => {
      const res = await request(app)
        .delete("/procedimentos/invalido")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(400);
      expect(procedimentosService.remover).not.toHaveBeenCalled();
    });

    it("deve retornar 401 se não estiver autenticado", async () => {
      const res = await request(app).delete("/procedimentos/5");

      expect(res.status).toBe(401);
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .delete("/procedimentos/5")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });
});
