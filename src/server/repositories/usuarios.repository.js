import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { usuarios } from "../../db/schemas/usuarios.js";

// Nunca expõe a coluna "senha"
const publico = {
  id: usuarios.id,
  nome: usuarios.nome,
  email: usuarios.email,
  tipo: usuarios.tipo,
};

const primeiro = (linhas) => linhas[0] ?? null;

export const usuariosRepository = {
  listar: () => db.select(publico).from(usuarios).orderBy(usuarios.nome),

  buscarPorId: async (id) =>
    primeiro(await db.select(publico).from(usuarios).where(eq(usuarios.id, id))),

  // Retorna a linha completa (com hash) — usar apenas no login
  buscarPorEmail: async (email) =>
    primeiro(await db.select().from(usuarios).where(eq(usuarios.email, email))),

  criar: async (dados) =>
    primeiro(await db.insert(usuarios).values(dados).returning(publico)),

  atualizar: async (id, dados) =>
    primeiro(
      await db.update(usuarios).set(dados).where(eq(usuarios.id, id)).returning(publico)
    ),

  remover: async (id) =>
    primeiro(
      await db.delete(usuarios).where(eq(usuarios.id, id)).returning({ id: usuarios.id })
    ),
};
