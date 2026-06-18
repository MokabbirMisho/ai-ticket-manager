-- AddEnumValue
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- AddColumns
ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Student" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "KnowledgeArticle" ADD COLUMN "tenantId" TEXT;

-- BackfillDefaultTenant
INSERT INTO "Tenant" (
    "id",
    "name",
    "slug",
    "isActive",
    "plan",
    "subscriptionStatus",
    "paymentProvider",
    "createdAt",
    "updatedAt"
)
VALUES (
    '00000000-0000-4000-8000-000000000001',
    'Default Workspace',
    'default',
    true,
    'FREE',
    'TRIAL',
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "User"
SET "tenantId" = (SELECT "id" FROM "Tenant" WHERE "slug" = 'default')
WHERE "tenantId" IS NULL
  AND "role" <> 'SUPER_ADMIN';

UPDATE "Student"
SET "tenantId" = (SELECT "id" FROM "Tenant" WHERE "slug" = 'default')
WHERE "tenantId" IS NULL;

UPDATE "Ticket"
SET "tenantId" = (SELECT "id" FROM "Tenant" WHERE "slug" = 'default')
WHERE "tenantId" IS NULL;

UPDATE "KnowledgeArticle"
SET "tenantId" = (SELECT "id" FROM "Tenant" WHERE "slug" = 'default')
WHERE "tenantId" IS NULL;

-- EnforceRequiredTenantForTenantData
ALTER TABLE "Student" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Ticket" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "KnowledgeArticle" ALTER COLUMN "tenantId" SET NOT NULL;

-- CreateIndexes
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "Student_tenantId_idx" ON "Student"("tenantId");
CREATE INDEX "Ticket_tenantId_idx" ON "Ticket"("tenantId");
CREATE INDEX "KnowledgeArticle_tenantId_idx" ON "KnowledgeArticle"("tenantId");

-- AddForeignKeys
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
