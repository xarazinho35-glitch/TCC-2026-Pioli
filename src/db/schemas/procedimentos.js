import { pgTable, serial, integer, varchar, numeric } from "drizzle-orm/pg-core";
 
export const procedimentos = pgTable("procedimentos", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: varchar("descricao", { length: 255 }),
  duracao: integer("duracao"), // em minutos
  preco: numeric("preco", { precision: 10, scale: 2 }),
});
 