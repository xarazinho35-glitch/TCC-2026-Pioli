import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mocks dos módulos dependentes (usando unstable_mockModule para ES Modules no Jest)
jest.unstable_mockModule("../services/agendamentos.service.js", () => ({
  agendamentosService: {
    criar: jest.fn(),
    listar: jest.fn(),
    listarMeus: jest.fn(),
    buscar: jest.fn(),
    atualizar: jest.fn(),
    atualizarStatus: jest.fn(),
    cancelar: jest.fn(),
    remover: jest.fn(),
  },
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  autenticar: jest.fn((req, res, next) => {
    // Simula o usuário autenticado via header customizado nos testes
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
const { default: agendamentosRouter } = await import("../routes/agendamentos.routes.js");
const { agendamentosService } = await import("../services/agendamentos.service.js");

// Configuração isolada do app Express para os testes
const app = express();
app.use(express.json());
app.use("/agendamentos", agendamentosRouter);

// Middleware global de tratamento de erros para simular o comportamento real da API
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ erro: err.message });
});

describe("Rotas de Agendamentos (/agendamentos)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // AUTENTICAÇÃO GERAL
  // =========================================================================
  describe("Autenticação", () => {
    it("deve retornar 401 se o usuário não estiver autenticado", async () => {
      const res = await request(app).get("/agendamentos/meus");
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // ROTAS DE PACIENTE
  // =========================================================================
  describe("POST /agendamentos (Paciente)", () => {
    it("deve criar um agendamento com sucesso (201)", async () => {
      const payload = { data: "2026-11-20", horario: "14:00", servicoId: 2 };
      const retornoMock = {
        agendamento: { id: 10, ...payload, status: "pendente" },
        whatsappUrl: "https://wa.me/5534999999999",
      };
      agendamentosService.criar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .post("/agendamentos")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "5")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(retornoMock);
      expect(agendamentosService.criar).toHaveBeenCalledWith(
        { id: 5, perfil: "paciente" },
        payload
      );
    });

    it("deve retornar 403 se um admin tentar criar agendamento nesta rota", async () => {
      const res = await request(app)
        .post("/agendamentos")
        .set("x-test-perfil", "admin")
        .send({ data: "2026-11-20" });

      expect(res.status).toBe(403);
      expect(agendamentosService.criar).not.toHaveBeenCalled();
    });
  });

  describe("GET /agendamentos/meus (Paciente)", () => {
    it("deve listar os agendamentos do paciente logado e repassar filtro de status", async () => {
      const listaMock = [{ id: 1, status: "pendente" }];
      agendamentosService.listarMeus.mockResolvedValue(listaMock);

      const res = await request(app)
        .get("/agendamentos/meus?status=pendente")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "7");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(listaMock);
      expect(agendamentosService.listarMeus).toHaveBeenCalledWith(
        { id: 7, perfil: "paciente" },
        { status: "pendente" }
      );
    });

    it("deve bloquear acesso de admin na rota /meus (403)", async () => {
      const res = await request(app)
        .get("/agendamentos/meus")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // ROTAS DE ADMINISTRADOR
  // =========================================================================
  describe("GET /agendamentos (Admin)", () => {
    it("deve listar todos os agendamentos com filtro opcional de status", async () => {
      const listaMock = [{ id: 1 }, { id: 2 }];
      agendamentosService.listar.mockResolvedValue(listaMock);

      const res = await request(app)
        .get("/agendamentos?status=confirmado")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(listaMock);
      expect(agendamentosService.listar).toHaveBeenCalledWith({ status: "confirmado" });
    });

    it("deve retornar 403 se um paciente tentar listar todos os agendamentos", async () => {
      const res = await request(app)
        .get("/agendamentos")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /agendamentos/:id (Admin)", () => {
    it("deve atualizar um agendamento existente", async () => {
      const dadosAtualizados = { horario: "16:30" };
      const retornoMock = { id: 12, horario: "16:30" };
      agendamentosService.atualizar.mockResolvedValue(retornoMock);

      const res = await request(app)
        .put("/agendamentos/12")
        .set("x-test-perfil", "admin")
        .send(dadosAtualizados);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(retornoMock);
      expect(agendamentosService.atualizar).toHaveBeenCalledWith(12, dadosAtualizados);
    });

    it("deve retornar 400 ao passar ID inválido", async () => {
      const res = await request(app)
        .put("/agendamentos/abc")
        .set("x-test-perfil", "admin")
        .send({ horario: "16:30" });

      expect(res.status).toBe(400);
      expect(agendamentosService.atualizar).not.toHaveBeenCalled();
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .put("/agendamentos/12")
        .set("x-test-perfil", "paciente")
        .send({ horario: "16:30" });

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /agendamentos/:id/status (Admin)", () => {
    it("deve atualizar apenas o status do agendamento", async () => {
      const retornoMock = { id: 15, status: "confirmado" };
      agendamentosService.atualizarStatus.mockResolvedValue(retornoMock);

      const res = await request(app)
        .patch("/agendamentos/15/status")
        .set("x-test-perfil", "admin")
        .send({ status: "confirmado" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(retornoMock);
      expect(agendamentosService.atualizarStatus).toHaveBeenCalledWith(15, "confirmado");
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .patch("/agendamentos/15/status")
        .set("x-test-perfil", "paciente")
        .send({ status: "confirmado" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /agendamentos/:id (Admin)", () => {
    it("deve remover o agendamento e retornar status 204 sem corpo", async () => {
      agendamentosService.remover.mockResolvedValue();

      const res = await request(app)
        .delete("/agendamentos/20")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(204);
      expect(res.text).toBe("");
      expect(agendamentosService.remover).toHaveBeenCalledWith(20);
    });

    it("deve retornar 403 para paciente", async () => {
      const res = await request(app)
        .delete("/agendamentos/20")
        .set("x-test-perfil", "paciente");

      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // ROTAS COMPARTILHADAS (PACIENTE DONO OU ADMIN)
  // =========================================================================
  describe("GET /agendamentos/:id (Paciente ou Admin)", () => {
    it("deve buscar agendamento por ID para paciente", async () => {
      const agendamentoMock = { id: 8, pacienteId: 3 };
      agendamentosService.buscar.mockResolvedValue(agendamentoMock);

      const res = await request(app)
        .get("/agendamentos/8")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "3");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(agendamentoMock);
      expect(agendamentosService.buscar).toHaveBeenCalledWith(8, {
        id: 3,
        perfil: "paciente",
      });
    });

    it("deve buscar agendamento por ID para admin", async () => {
      const agendamentoMock = { id: 8, pacienteId: 3 };
      agendamentosService.buscar.mockResolvedValue(agendamentoMock);

      const res = await request(app)
        .get("/agendamentos/8")
        .set("x-test-perfil", "admin")
        .set("x-test-user-id", "1");

      expect(res.status).toBe(200);
      expect(agendamentosService.buscar).toHaveBeenCalledWith(8, {
        id: 1,
        perfil: "admin",
      });
    });

    it("deve repassar erro de posse (403) vindo do service (RN03)", async () => {
      const erroPermissao = new Error("Você não tem permissão para acessar este agendamento");
      erroPermissao.status = 403;
      agendamentosService.buscar.mockRejectedValue(erroPermissao);

      const res = await request(app)
        .get("/agendamentos/8")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "99");

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ erro: "Você não tem permissão para acessar este agendamento" });
    });
  });

  describe("PATCH /agendamentos/:id/cancelar (Paciente ou Admin)", () => {
    it("deve cancelar o agendamento e retornar os dados atualizados", async () => {
      const canceladoMock = { id: 8, status: "cancelado" };
      agendamentosService.cancelar.mockResolvedValue(canceladoMock);

      const res = await request(app)
        .patch("/agendamentos/8/cancelar")
        .set("x-test-perfil", "paciente")
        .set("x-test-user-id", "3");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(canceladoMock);
      expect(agendamentosService.cancelar).toHaveBeenCalledWith(8, {
        id: 3,
        perfil: "paciente",
      });
    });

    it("deve retornar 400 se o ID for inválido", async () => {
      const res = await request(app)
        .patch("/agendamentos/invalido/cancelar")
        .set("x-test-perfil", "admin");

      expect(res.status).toBe(400);
      expect(agendamentosService.cancelar).not.toHaveBeenCalled();
    });
  });
});
