import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { pacientes } from "../../db/schemas/pacientes.js";
import { usuarios } from "../../db/schemas/usuarios.js";

const comUsuario = {
  id: pacientes.id,
  usuarioId: pacientes.usuarioId,
  nome: usuarios.nome,
  email: usuarios.email,
  telefone: pacientes.telefone,
  dataNascimento: pacientes.dataNascimento,
  cpf: pacientes.cpf,
};

const base = () =>
  db
    .select(comUsuario)
    .from(pacientes)
    .innerJoin(usuarios, eq(usuarios.id, pacientes.usuarioId));

const primeiro = (linhas) => linhas[0] ?? null;

export const pacientesRepository = {
  listar: () => base().orderBy(usuarios.nome),

  buscarPorId: async (id) => primeiro(await base().where(eq(pacientes.id, id))),

  buscarPorUsuarioId: async (usuarioId) =>
    primeiro(await base().where(eq(pacientes.usuarioId, usuarioId))),

  criar: async (dados) => {
    const [novo] = await db.insert(pacientes).values(dados).returning({ id: pacientes.id });
    return pacientesRepository.buscarPorId(novo.id);
  },

  atualizar: async (id, dados) => {
    const [r] = await db
      .update(pacientes)
      .set(dados)
      .where(eq(pacientes.id, id))
      .returning({ id: pacientes.id });
    return r ? pacientesRepository.buscarPorId(r.id) : null;
  },

  remover: async (id) =>
    primeiro(
      await db.delete(pacientes).where(eq(pacientes.id, id)).returning({ id: pacientes.id })
    ),
};
