import type { FilterStrategy } from './FilterStrategy.js';

// Rol Context del patrón Strategy: orquesta una familia de FilterStrategy
// Es genérico y reutilizable por cualquier módulo de listado (vehicles, routes, alerts…).
export class FilterContext<Query, W extends object> {
  constructor(private readonly strategies: FilterStrategy<Query, W>[]) {}

  // Construye la condición `where` de Prisma combinando las estrategias aplicables.
  build(query: Query): W {
    const and = this.strategies
      .filter((s) => s.applies(query)) // conserva solo las que aplican
      .map((s) => s.toCondition(query)); // cada una aporta su condición
    return (and.length ? { AND: and } : {}) as W;
  }
}
