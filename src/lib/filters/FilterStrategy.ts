// Utilizamos el patrón Strategy para definir estrategias de filtrado en queries de listado

// interface para el Rol Strategy
export interface FilterStrategy<Query, W> {
  // Verifica si la estrategia concreta aplica a la query dada.
  // Ej: un filtro de State solo aplica si la query tiene un valor para `state`
  applies(query: Query): boolean;

  // Convierte la query de listado a la condición `where` de Prisma correspondiente
  toCondition(query: Query): W;
}
