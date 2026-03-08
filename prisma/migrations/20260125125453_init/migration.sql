-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('MANUAL', 'IMPORT', 'SCAN', 'LINK');

-- CreateEnum
CREATE TYPE "FollowStatus" AS ENUM ('NONE', 'FOLLOWING');

-- CreateEnum
CREATE TYPE "ShareTokenType" AS ENUM ('CARD', 'CONTACT');

-- CreateEnum
CREATE TYPE "ShareTokenMode" AS ENUM ('PUBLIC', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('CARD_SHARED', 'CONTACT_RECEIVED', 'QR_SCANNED', 'LINK_OPENED', 'CONTACT_SAVED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "position" TEXT,
    "company" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "birthday" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_card_phones" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "business_card_phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_card_emails" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "business_card_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_card_socials" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "business_card_socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" "ContactSource" NOT NULL DEFAULT 'MANUAL',
    "linkedCardId" TEXT,
    "followStatus" "FollowStatus" NOT NULL DEFAULT 'NONE',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_phones" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "contact_phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_emails" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "contact_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_socials" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "contact_socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "ShareTokenType" NOT NULL,
    "mode" "ShareTokenMode" NOT NULL DEFAULT 'PUBLIC',
    "targetCardId" TEXT,
    "targetContactId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_events" (
    "id" TEXT NOT NULL,
    "type" "ActivityEventType" NOT NULL,
    "actorUserId" TEXT,
    "targetCardId" TEXT,
    "targetContactId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "business_cards_userId_idx" ON "business_cards"("userId");

-- CreateIndex
CREATE INDEX "business_cards_userId_updatedAt_idx" ON "business_cards"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "business_card_phones_cardId_idx" ON "business_card_phones"("cardId");

-- CreateIndex
CREATE INDEX "business_card_emails_cardId_idx" ON "business_card_emails"("cardId");

-- CreateIndex
CREATE INDEX "business_card_socials_cardId_idx" ON "business_card_socials"("cardId");

-- CreateIndex
CREATE INDEX "contacts_ownerUserId_idx" ON "contacts"("ownerUserId");

-- CreateIndex
CREATE INDEX "contacts_ownerUserId_displayName_idx" ON "contacts"("ownerUserId", "displayName");

-- CreateIndex
CREATE INDEX "contacts_linkedCardId_idx" ON "contacts"("linkedCardId");

-- CreateIndex
CREATE INDEX "contacts_followStatus_idx" ON "contacts"("followStatus");

-- CreateIndex
CREATE INDEX "contact_phones_contactId_idx" ON "contact_phones"("contactId");

-- CreateIndex
CREATE INDEX "contact_emails_contactId_idx" ON "contact_emails"("contactId");

-- CreateIndex
CREATE INDEX "contact_socials_contactId_idx" ON "contact_socials"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "share_tokens_token_key" ON "share_tokens"("token");

-- CreateIndex
CREATE INDEX "share_tokens_token_idx" ON "share_tokens"("token");

-- CreateIndex
CREATE INDEX "share_tokens_targetCardId_idx" ON "share_tokens"("targetCardId");

-- CreateIndex
CREATE INDEX "share_tokens_targetContactId_idx" ON "share_tokens"("targetContactId");

-- CreateIndex
CREATE INDEX "activity_events_targetCardId_createdAt_idx" ON "activity_events"("targetCardId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_events_actorUserId_idx" ON "activity_events"("actorUserId");

-- CreateIndex
CREATE INDEX "activity_events_type_idx" ON "activity_events"("type");

-- CreateIndex
CREATE INDEX "imports_userId_idx" ON "imports"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_cards" ADD CONSTRAINT "business_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_card_phones" ADD CONSTRAINT "business_card_phones_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "business_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_card_emails" ADD CONSTRAINT "business_card_emails_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "business_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_card_socials" ADD CONSTRAINT "business_card_socials_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "business_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_linkedCardId_fkey" FOREIGN KEY ("linkedCardId") REFERENCES "business_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_phones" ADD CONSTRAINT "contact_phones_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_emails" ADD CONSTRAINT "contact_emails_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_socials" ADD CONSTRAINT "contact_socials_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_targetCardId_fkey" FOREIGN KEY ("targetCardId") REFERENCES "business_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_targetContactId_fkey" FOREIGN KEY ("targetContactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_targetCardId_fkey" FOREIGN KEY ("targetCardId") REFERENCES "business_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_targetContactId_fkey" FOREIGN KEY ("targetContactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imports" ADD CONSTRAINT "imports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
