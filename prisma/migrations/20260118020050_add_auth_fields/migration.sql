-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "jobTitle" TEXT,
    "whatsapp" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "googleReviews" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("companyId", "createdAt", "email", "googleReviews", "id", "instagram", "jobTitle", "linkedin", "name", "phone", "photoUrl", "slug", "updatedAt", "website", "whatsapp") SELECT "companyId", "createdAt", "email", "googleReviews", "id", "instagram", "jobTitle", "linkedin", "name", "phone", "photoUrl", "slug", "updatedAt", "website", "whatsapp" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_slug_key" ON "Employee"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
