import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env, isProduction, isTest } from '../config/env.js';

// Rol Singleton: garantiza una única instancia del cliente (una sola pool de conexiones)
// y ofrece un punto de acceso global vía Database.get(). 
// El constructor es privado: nadie puede hacer `new Database()` desde fuera.
export class Database {
  private static instance: Database | undefined;

  public readonly client: PrismaClient;
  
  // Constructor protegido por el singleton
  private constructor() {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL es requerida para inicializar la conexion (configúrala en .env).');
    }
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
    this.client = new PrismaClient({ adapter, log: isTest ? [] : ['warn', 'error'] });
  }

  // Punto de acceso global: crea la instancia la primera vez y la reutiliza siempre
  public static get(): Database {
    const g = globalThis as unknown as { __db?: Database };

    if(Database.instance == null) {
      Database.instance = (g.__db != null) ? g.__db : new Database();
    }

    if (!isProduction) g.__db = Database.instance; // evita múltiples clientes en dev
    return Database.instance;
  }
}
