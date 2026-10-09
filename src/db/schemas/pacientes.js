import { pgTable, serial, integer, varchar, date } from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios.js";
 
export const pacientes = pgTable("pacientes", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .unique()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  telefone: varchar("telefone", { length: 255 }),
  dataNascimento: date("data_nascimento"),
  cpf: varchar("cpf", { length: 255 }).unique(),
});
 