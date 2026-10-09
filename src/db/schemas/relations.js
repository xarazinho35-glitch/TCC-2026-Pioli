import { defineRelations as relations } from "drizzle-orm";
import { usuarios } from "./usuarios.js";
import { pacientes } from "./pacientes.js";
import { procedimentos } from "./procedimentos.js";
import { agendamentos } from "./agendamentos.js";
 
export const usuariosRelations = relations({usuarios}, ({ one }) => ({
  paciente: one(pacientes, {
    fields: [usuarios.id],
    references: [pacientes.usuarioId],
  }),
}));
 
export const pacientesRelations = relations({pacientes}, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [pacientes.usuarioId],
    references: [usuarios.id],
  }),
  agendamentos: many(agendamentos),
}));
 
export const procedimentosRelations = relations({procedimentos}, ({ many }) => ({
  agendamentos: many(agendamentos),
}));
 
export const agendamentosRelations = relations({agendamentos}, ({ one }) => ({
  paciente: one(pacientes, {
    fields: [agendamentos.pacientesId],
    references: [pacientes.id],
  }),
  procedimento: one(procedimentos, {
    fields: [agendamentos.procedimentoId],
    references: [procedimentos.id],
  }),
}));