-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "colorTop" TEXT,
    "colorBottom" TEXT,
    "gradientAngle" INTEGER DEFAULT 135,
    "bgImageUrl" TEXT,
    "maxEmployees" INTEGER NOT NULL DEFAULT 5
);
INSERT INTO "new_Company" ("bgImageUrl", "colorBottom", "colorTop", "createdAt", "gradientAngle", "id", "logoUrl", "name", "updatedAt") SELECT "bgImageUrl", "colorBottom", "colorTop", "createdAt", "gradientAngle", "id", "logoUrl", "name", "updatedAt" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
