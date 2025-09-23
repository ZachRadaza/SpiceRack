-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ingredients" JSONB NOT NULL,
    "procedures" JSONB NOT NULL,
    "imageLink" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "mealTime" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Recipe" ("accountName", "createdAt", "id", "imageLink", "ingredients", "mealTime", "mealType", "name", "procedures", "updatedAt") SELECT "accountName", "createdAt", "id", "imageLink", "ingredients", "mealTime", "mealType", "name", "procedures", "updatedAt" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
