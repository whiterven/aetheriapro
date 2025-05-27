-- Migration to add createdAt column to User table with default value
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
