/*
  Warnings:

  - Made the column `ownerId` on table `Recipe` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Recipe" ALTER COLUMN "ownerId" SET NOT NULL;
