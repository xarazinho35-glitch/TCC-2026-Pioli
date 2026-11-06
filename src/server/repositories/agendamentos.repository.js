import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { agendamentos } from "../../db/schemas/agendamentos.js";
import { pacientes } from "../../db/schemas/pacientes.js";
import { procedimentos } from "../../db/schemas/procedimentos.js";
import { usuarios } from "../../db/schemas/usuarios.js";

const detalhado = {
  id: agendamentos.id,
  data: agendamentos.data,
  horario: agendamentos.horario,
  status: agendamentos.status,
  observacoes: agendamentos.observacoes,
  criadoEm: agendamentos.criadoEm,
  paciente: {
    id: pacientes.id,
    nome: usuarios.nome,
    telefone: pacientes.telefone,
  },
  procedimento: {
    id: procedimentos.id,
    nome: procedimentos.nome,
    duracao: procedimentos.duracao,
    preco: procedimentos.preco,
  },
};

const base = () =>
  db
    .select(detalhado)
    .from(agendamentos)
    .innerJoin(pacientes, eq(pacientes.id, agendamentos.pacientesId))
    .innerJoin(usuarios, eq(usuarios.id, pacientes.usuarioId))
    .innerJoin(procedimentos, eq(procedimentos.id, agendamentos.procedimentoId));

const primeiro = (linhas) => linhas[0] ?? null;

export const agendamentosRepository = {
  // filtros opcionais: { status, pacienteId }
  listar: ({ status, pacienteId } = {}) =>
    base()
      .where(
        and(
          status ? eq(agendamentos.status, status) : undefined,
          pacienteId ? eq(agendamentos.pacientesId, pacienteId) : undefined
        )
      )
      .orderBy(asc(agendamentos.data), asc(agendamentos.horario)),

  buscarPorId: async (id) => primeiro(await base().where(eq(agendamentos.id, id))),

  criar: async (dados) => {
    const [novo] = await db
      .insert(agendamentos)
      .values(dados)
      .returning({ id: agendamentos.id });
    return agendamentosRepository.buscarPorId(novo.id);
  },

  atualizar: async (id, dados) => {
    const [r] = await db
      .update(agendamentos)
      .set(dados)
      .where(eq(agendamentos.id, id))
      .returning({ id: agendamentos.id });
    return r ? agendamentosRepository.buscarPorId(r.id) : null;
  },

  remover: async (id) =>
    primeiro(
      await db
        .delete(agendamentos)
        .where(eq(agendamentos.id, id))
        .returning({ id: agendamentos.id })
    ),
};
