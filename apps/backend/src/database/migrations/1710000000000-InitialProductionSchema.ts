import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialProductionSchema1710000000000 implements MigrationInterface {
    name = 'InitialProductionSchema1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enums
        await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('admin', 'manager', 'employee')`);

        // Tables
        await queryRunner.query(`CREATE TABLE "organizations" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "name" character varying NOT NULL, 
            "slug" character varying NOT NULL, 
            "status" character varying NOT NULL DEFAULT 'active', 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_organizations_name" UNIQUE ("name"), 
            CONSTRAINT "UQ_organizations_slug" UNIQUE ("slug"), 
            CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "users" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "organizationId" uuid NOT NULL, 
            "email" character varying NOT NULL, 
            "password" character varying NOT NULL, 
            "firstName" character varying NOT NULL, 
            "lastName" character varying NOT NULL, 
            "avatar" character varying, 
            "role" "user_role_enum" NOT NULL DEFAULT 'employee', 
            "status" character varying NOT NULL DEFAULT 'active', 
            "department" character varying, 
            "designation" character varying, 
            "phone" character varying, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_users" PRIMARY KEY ("id"),
            CONSTRAINT "FK_users_organizations" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
        )`);

        await queryRunner.query(`CREATE TABLE "projects" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "organizationId" uuid NOT NULL, 
            "name" character varying NOT NULL, 
            "description" character varying, 
            "status" character varying NOT NULL DEFAULT 'planning', 
            "startDate" TIMESTAMP, 
            "endDate" TIMESTAMP, 
            "budget" double precision, 
            "progress" double precision NOT NULL DEFAULT 0, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_projects" PRIMARY KEY ("id"),
            CONSTRAINT "FK_projects_organizations" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
        )`);

        await queryRunner.query(`CREATE TABLE "project_members" (
            "projectId" uuid NOT NULL, 
            "userId" uuid NOT NULL, 
            CONSTRAINT "PK_project_members" PRIMARY KEY ("projectId", "userId"),
            CONSTRAINT "FK_project_members_projects" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_project_members_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        )`);

        await queryRunner.query(`CREATE TABLE "work_sessions" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "organizationId" uuid NOT NULL, 
            "userId" uuid NOT NULL, 
            "projectId" uuid, 
            "task" character varying, 
            "description" text, 
            "startTime" TIMESTAMP NOT NULL, 
            "endTime" TIMESTAMP, 
            "duration" integer NOT NULL DEFAULT 0, 
            "status" character varying NOT NULL DEFAULT 'running', 
            "date" date NOT NULL, 
            "version" integer NOT NULL, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_work_sessions" PRIMARY KEY ("id"),
            CONSTRAINT "FK_work_sessions_organizations" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_work_sessions_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_work_sessions_projects" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL
        )`);

        // Partitioned table: activity_logs
        await queryRunner.query(`CREATE TABLE "activity_logs" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "organizationId" uuid NOT NULL, 
            "userId" uuid NOT NULL, 
            "sessionId" uuid, 
            "action" character varying NOT NULL, 
            "details" text, 
            "type" character varying NOT NULL, 
            "timestamp" TIMESTAMP NOT NULL, 
            PRIMARY KEY ("id", "timestamp")
        ) PARTITION BY RANGE ("timestamp")`);

        // Create default partitions (e.g., for 2026-02)
        await queryRunner.query(`CREATE TABLE "activity_logs_2026_02" PARTITION OF "activity_logs"
            FOR VALUES FROM ('2026-02-01') TO ('2026-03-01')`);

        await queryRunner.query(`CREATE TABLE "daily_summaries" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "organizationId" uuid NOT NULL, 
            "userId" uuid NOT NULL, 
            "date" date NOT NULL, 
            "totalWorkSeconds" integer NOT NULL DEFAULT 0, 
            "totalIdleSeconds" integer NOT NULL DEFAULT 0, 
            "productivityScore" double precision NOT NULL DEFAULT 0, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_daily_summaries" PRIMARY KEY ("id"),
            CONSTRAINT "FK_daily_summaries_organizations" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_daily_summaries_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        )`);

        await queryRunner.query(`CREATE TABLE "alerts" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
            "organizationId" uuid NOT NULL, 
            "userId" uuid NOT NULL, 
            "type" character varying NOT NULL, 
            "severity" character varying NOT NULL, 
            "title" character varying NOT NULL, 
            "message" text NOT NULL, 
            "isRead" boolean NOT NULL DEFAULT false, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_alerts" PRIMARY KEY ("id"),
            CONSTRAINT "FK_alerts_organizations" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_alerts_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        )`);

        // Indexes (Requested)
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_org_email" ON "users" ("organizationId", "email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_id_status" ON "users" ("id", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_activity_logs_session_ts" ON "activity_logs" ("sessionId", "timestamp")`);
        await queryRunner.query(`CREATE INDEX "IDX_work_sessions_user_date" ON "work_sessions" ("userId", "date")`);

        // Additional useful indexes
        await queryRunner.query(`CREATE INDEX "IDX_daily_summaries_user_date" ON "daily_summaries" ("userId", "date")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_daily_summaries_user_date" ON "daily_summaries" ("userId", "date")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP TABLE "daily_summaries"`);
        await queryRunner.query(`DROP TABLE "activity_logs"`);
        await queryRunner.query(`DROP TABLE "work_sessions"`);
        await queryRunner.query(`DROP TABLE "project_members"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
