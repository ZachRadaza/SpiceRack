-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ingredients" JSONB NOT NULL,
    "procedures" JSONB NOT NULL,
    "imageLink" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "mealTime" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
