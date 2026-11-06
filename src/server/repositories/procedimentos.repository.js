import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { procedimentos } from "../../db/schemas/procedimentos.js";

const primeiro = (linhas) => linhas[0] ?? null;

export const procedimentosRepository = {
  listar: () => db.select().from(procedimentos).orderBy(procedimentos.nome),

  buscarPorId: async (id) =>
    primeiro(await db.select().from(procedimentos).where(eq(procedimentos.id, id))),

  criar: async (dados) =>
    primeiro(await db.insert(procedimentos).values(dados).returning()),

  atualizar: async (id, dados) =>
    primeiro(
      await db.update(procedimentos).set(dados).where(eq(procedimentos.id, id)).returning()
    ),

  remover: async (id) =>
    primeiro(
      await db
        .delete(procedimentos)
        .where(eq(procedimentos.id, id))
        .returning({ id: procedimentos.id })
    ),
};
