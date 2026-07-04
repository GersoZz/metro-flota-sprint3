//Matriz de roles para RBAC
export const WRITE_ROLES = ['admin', 'operador'] as const;
export const ACK_ROLES = ['admin', 'operador', 'supervisor'] as const;

// Roles nuevos del SRS (RF-28).
// planificador escribe rutas, jefe_mantenimiento escribe mantenimiento,
// directivo es solo lectura (no aparece en ninguna matriz de escritura).
export const PLANNING_ROLES = ['admin', 'planificador'] as const;
export const MAINT_ROLES = ['admin', 'jefe_mantenimiento'] as const;
