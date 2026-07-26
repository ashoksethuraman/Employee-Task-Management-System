import { execSync } from 'child_process';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import prisma from './prisma';
import { Role, TaskStatus } from '@prisma/client';

interface ParsedDatabaseUrl {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function parseDatabaseUrl(url: string): ParsedDatabaseUrl {
  const parsed = new URL(url);
  const database = parsed.pathname?.replace(/\//g, '');

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  };
}

async function createDatabaseIfMissing(url: string) {
  const { host, port, user, password, database } = parseDatabaseUrl(url);
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
}

async function seedInitialData() {
  const adminEmail = 'admin@company.com';
  const managerEmail = 'manager@company.com';
  const employeeEmail = 'employee@company.com';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
    const hashedManagerPassword = await bcrypt.hash('Manager@123', 10);
    const hashedEmployeePassword = await bcrypt.hash('Employee@123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: hashedAdminPassword,
        role: Role.ADMIN,
      },
    });

    const manager = await prisma.user.create({
      data: {
        name: 'Team Manager',
        email: managerEmail,
        password: hashedManagerPassword,
        role: Role.MANAGER,
      },
    });

    const employee = await prisma.user.create({
      data: {
        name: 'Employee User',
        email: employeeEmail,
        password: hashedEmployeePassword,
        role: Role.EMPLOYEE,
      },
    });

    const defaultProject = await prisma.project.create({
      data: {
        name: 'Employee Management',
        description: 'Default project for seeded tasks',
      },
    });

    await prisma.task.createMany({
      data: [
        {
          title: 'Review quarterly report',
          description: 'Analyze the finance team report and prepare feedback.',
          status: TaskStatus.PENDING,
          assigneeId: manager.id,
          creatorId: admin.id,
          projectId: defaultProject.id,
        },
        {
          title: 'Complete employee training module',
          description: 'Finish the mandatory security training by Friday.',
          status: TaskStatus.IN_PROGRESS,
          assigneeId: employee.id,
          creatorId: manager.id,
          projectId: defaultProject.id,
        },
      ],
    });
  }
}

export async function ensureDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be defined in environment variables');
  }

  await createDatabaseIfMissing(databaseUrl);
  const dbRoot = process.cwd();
  execSync('npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
    cwd: dbRoot,
  });
  await seedInitialData();
}
