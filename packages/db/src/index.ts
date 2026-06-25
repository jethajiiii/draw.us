import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
console.log("databaseURL", connectionString);

const adapter = new PrismaNeon({ connectionString });

export const prismaClient = new PrismaClient({ adapter });