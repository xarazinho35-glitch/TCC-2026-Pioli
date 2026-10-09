import {
  pgTable, serial, integer, varchar, date, time, timestamp, unique,
} from "drizzle-orm/pg-core";
import { pacientes } from "./pacientes.js";
import { procedimentos } from "./procedimentos.js";
 
export const agendamentos = pgTable(
  "agendamentos",
  {
    id: serial("id").primaryKey(),
    pacientesId: integer("pacientes_id")
      .notNull()
      .references(() => pacientes.id, { onDelete: "cascade" }),
    procedimentoId: integer("procedimento_id")
      .notNull()
      .references(() => procedimentos.id, { onDelete: "restrict" }),
    data: date("data").notNull(),
    horario: time("horario").notNull(),
    status: varchar("status", { length: 255 }).notNull().default("pendente"), // 'pendente' | 'confirmado' | 'cancelado'
    observacoes: varchar("observacoes", { length: 255 }),
    criadoEm: timestamp("criado_em").defaultNow(),
  },
  // opcional: impede dois agendamentos no mesmo dia e horário
  (t) => [unique("uq_agendamentos_data_horario").on(t.data, t.horario)]
);
 