-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(30) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(30) NOT NULL,
    `tokenHash` VARCHAR(255) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_tokenHash_key`(`tokenHash`),
    INDEX `refresh_tokens_userId_idx`(`userId`),
    INDEX `refresh_tokens_tokenHash_idx`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_cards` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `website` VARCHAR(191) NULL,
    `birthday` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `business_cards_userId_idx`(`userId`),
    INDEX `business_cards_userId_updatedAt_idx`(`userId`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_card_phones` (
    `id` VARCHAR(30) NOT NULL,
    `cardId` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,

    INDEX `business_card_phones_cardId_idx`(`cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_card_emails` (
    `id` VARCHAR(30) NOT NULL,
    `cardId` VARCHAR(30) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    INDEX `business_card_emails_cardId_idx`(`cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_card_socials` (
    `id` VARCHAR(30) NOT NULL,
    `cardId` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `link` TEXT NOT NULL,

    INDEX `business_card_socials_cardId_idx`(`cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` VARCHAR(30) NOT NULL,
    `ownerUserId` VARCHAR(30) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `tags` JSON NOT NULL,
    `source` ENUM('MANUAL', 'IMPORT', 'SCAN', 'LINK') NOT NULL DEFAULT 'MANUAL',
    `linkedCardId` VARCHAR(30) NULL,
    `followStatus` ENUM('NONE', 'FOLLOWING') NOT NULL DEFAULT 'NONE',
    `lastSyncedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contacts_ownerUserId_idx`(`ownerUserId`),
    INDEX `contacts_ownerUserId_displayName_idx`(`ownerUserId`, `displayName`),
    INDEX `contacts_linkedCardId_idx`(`linkedCardId`),
    INDEX `contacts_followStatus_idx`(`followStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_phones` (
    `id` VARCHAR(30) NOT NULL,
    `contactId` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,

    INDEX `contact_phones_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_emails` (
    `id` VARCHAR(30) NOT NULL,
    `contactId` VARCHAR(30) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    INDEX `contact_emails_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_socials` (
    `id` VARCHAR(30) NOT NULL,
    `contactId` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `link` TEXT NOT NULL,

    INDEX `contact_socials_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `share_tokens` (
    `id` VARCHAR(30) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `type` ENUM('CARD', 'CONTACT') NOT NULL,
    `mode` ENUM('PUBLIC', 'ONE_TIME') NOT NULL DEFAULT 'PUBLIC',
    `targetCardId` VARCHAR(30) NULL,
    `targetContactId` VARCHAR(30) NULL,
    `createdByUserId` VARCHAR(30) NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `share_tokens_token_key`(`token`),
    INDEX `share_tokens_token_idx`(`token`),
    INDEX `share_tokens_targetCardId_idx`(`targetCardId`),
    INDEX `share_tokens_targetContactId_idx`(`targetContactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_events` (
    `id` VARCHAR(30) NOT NULL,
    `type` ENUM('CARD_SHARED', 'CONTACT_RECEIVED', 'QR_SCANNED', 'LINK_OPENED', 'CONTACT_SAVED') NOT NULL,
    `actorUserId` VARCHAR(30) NULL,
    `targetCardId` VARCHAR(30) NULL,
    `targetContactId` VARCHAR(30) NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_events_targetCardId_createdAt_idx`(`targetCardId`, `createdAt`),
    INDEX `activity_events_actorUserId_idx`(`actorUserId`),
    INDEX `activity_events_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imports` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `fileName` VARCHAR(191) NOT NULL,
    `totalRecords` INTEGER NOT NULL DEFAULT 0,
    `successCount` INTEGER NOT NULL DEFAULT 0,
    `failedCount` INTEGER NOT NULL DEFAULT 0,
    `errors` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `imports_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_messages` (
    `id` VARCHAR(30) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `email` VARCHAR(191) NULL,
    `userId` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_cards` ADD CONSTRAINT `business_cards_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_card_phones` ADD CONSTRAINT `business_card_phones_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `business_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_card_emails` ADD CONSTRAINT `business_card_emails_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `business_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_card_socials` ADD CONSTRAINT `business_card_socials_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `business_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_ownerUserId_fkey` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_linkedCardId_fkey` FOREIGN KEY (`linkedCardId`) REFERENCES `business_cards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_phones` ADD CONSTRAINT `contact_phones_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_emails` ADD CONSTRAINT `contact_emails_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_socials` ADD CONSTRAINT `contact_socials_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `share_tokens` ADD CONSTRAINT `share_tokens_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `share_tokens` ADD CONSTRAINT `share_tokens_targetCardId_fkey` FOREIGN KEY (`targetCardId`) REFERENCES `business_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `share_tokens` ADD CONSTRAINT `share_tokens_targetContactId_fkey` FOREIGN KEY (`targetContactId`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_events` ADD CONSTRAINT `activity_events_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_events` ADD CONSTRAINT `activity_events_targetCardId_fkey` FOREIGN KEY (`targetCardId`) REFERENCES `business_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_events` ADD CONSTRAINT `activity_events_targetContactId_fkey` FOREIGN KEY (`targetContactId`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imports` ADD CONSTRAINT `imports_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
