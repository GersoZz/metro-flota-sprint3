import type { PrismaClient } from '../generated/prisma/client.js';
import { Database } from './Database.js';

export const prisma: PrismaClient = Database.get().client;
