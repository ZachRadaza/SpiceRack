/*
  Warnings:

  - The primary key for the `Recipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Recipe` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_Recipe" ("accountName", "bookmarked", "createdAt", "id", "imageLink", "ingredients", "mealTime", "mealType", "name", "procedures", "updatedAt") SELECT "accountName", "bookmarked", "createdAt", "id", "imageLink", "ingredients", "mealTime", "mealType", "name", "procedures", "updatedAt" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
