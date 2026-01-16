-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "placeholder" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomField_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeCustomField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "EmployeeCustomField_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeeCustomField_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "CustomField" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyFieldVisibility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "showWhatsapp" BOOLEAN NOT NULL DEFAULT true,
    "showEmail" BOOLEAN NOT NULL DEFAULT true,
    "showPhone" BOOLEAN NOT NULL DEFAULT true,
    "showWebsite" BOOLEAN NOT NULL DEFAULT true,
    "showInstagram" BOOLEAN NOT NULL DEFAULT true,
    "showLinkedin" BOOLEAN NOT NULL DEFAULT true,
    "showGoogleReviews" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CompanyFieldVisibility_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCustomField_employeeId_customFieldId_key" ON "EmployeeCustomField"("employeeId", "customFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFieldVisibility_companyId_key" ON "CompanyFieldVisibility"("companyId");
