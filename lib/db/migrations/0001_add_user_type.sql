-- Add type column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "type" varchar NOT NULL DEFAULT 'regular' CHECK ("type" IN ('regular', 'pro', 'expert')); 