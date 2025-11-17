-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "InterestLevel" AS ENUM ('INTERESTED', 'VERY_INTERESTED', 'GOING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "initials" VARCHAR(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gigs" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "day" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gigs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gig_types" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "gig_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interestLevel" "InterestLevel" NOT NULL DEFAULT 'INTERESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "gigs_date_idx" ON "gigs"("date");

-- CreateIndex
CREATE INDEX "gigs_artist_idx" ON "gigs"("artist");

-- CreateIndex
CREATE INDEX "gigs_location_idx" ON "gigs"("location");

-- CreateIndex
CREATE INDEX "gig_types_gigId_idx" ON "gig_types"("gigId");

-- CreateIndex
CREATE INDEX "interests_gigId_idx" ON "interests"("gigId");

-- CreateIndex
CREATE INDEX "interests_userId_idx" ON "interests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "interests_gigId_userId_key" ON "interests"("gigId", "userId");

-- AddForeignKey
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gig_types" ADD CONSTRAINT "gig_types_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests" ADD CONSTRAINT "interests_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests" ADD CONSTRAINT "interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
