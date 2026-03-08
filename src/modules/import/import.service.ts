import { prisma } from '../../prisma/client';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { parse } from 'csv-parse/sync';
import { Prisma } from '@prisma/client';

interface VCardContact {
    displayName: string;
    phones: Array<{ name: string; number: string }>;
    emails: Array<{ label: string; email: string }>;
}

interface ImportError {
    contact?: string;
    error: string;
}

export class ImportService {
    async createImport(
        userId: string,
        file: Express.Multer.File
    ) {
        // Create import record
        const importRecord = await prisma.import.create({
            data: {
                userId,
                fileName: file.originalname,
                status: 'PROCESSING',
            },
        });

        try {
            let contacts: VCardContact[] = [];

            // Parse file based on type
            if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
                contacts = this.parseCSV(file.buffer.toString());
            } else if (
                file.mimetype === 'text/vcard' ||
                file.originalname.endsWith('.vcf')
            ) {
                contacts = this.parseVCard(file.buffer.toString());
            } else {
                throw new Error('Unsupported file format');
            }

            // Import contacts
            let successCount = 0;
            let failedCount = 0;
            const errors: ImportError[] = [];

            for (const contactData of contacts) {
                try {
                    await prisma.contact.create({
                        data: {
                            ownerUserId: userId,
                            displayName: contactData.displayName,
                            source: 'IMPORT',
                            phones: {
                                create: contactData.phones,
                            },
                            emails: {
                                create: contactData.emails,
                            },
                        },
                    });
                    successCount++;
                } catch (error) {
                    failedCount++;
                    errors.push({
                        contact: contactData.displayName,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }

            // Update import status
            await prisma.import.update({
                where: { id: importRecord.id },
                data: {
                    status: 'COMPLETED',
                    totalRecords: contacts.length,
                    successCount,
                    failedCount,
                    errors: (errors.length > 0 ? errors : []) as unknown as Prisma.InputJsonValue,
                },
            });

            return { importId: importRecord.id };
        } catch (error) {
            // Mark as failed
            await prisma.import.update({
                where: { id: importRecord.id },
                data: {
                    status: 'FAILED',
                    errors: [
                        {
                            error: error instanceof Error ? error.message : 'Unknown error',
                        },
                    ] as unknown as Prisma.InputJsonValue,
                },
            });

            throw error;
        }
    }

    async getImportStatus(importId: string, userId: string) {
        const importRecord = await prisma.import.findUnique({
            where: { id: importId },
        });

        if (!importRecord) {
            throw new NotFoundError('Import', importId);
        }

        if (importRecord.userId !== userId) {
            throw new ForbiddenError('You do not have access to this import');
        }

        return {
            status: importRecord.status,
            created: importRecord.successCount,
            updated: 0, // MVP doesn't support updates
            failed: importRecord.failedCount,
            totalRecords: importRecord.totalRecords,
            errors: importRecord.errors,
        };
    }

    private parseCSV(content: string): VCardContact[] {
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
        });

        return records.map((record: Record<string, string>) => ({
            displayName: record.name || record.displayName || 'Unknown',
            phones: record.phone
                ? [{ name: 'Mobile', number: record.phone }]
                : [],
            emails: record.email
                ? [{ label: 'Email', email: record.email }]
                : [],
        }));
    }

    private parseVCard(content: string): VCardContact[] {
        // Simplified vCard parsing (MVP)
        const contacts: VCardContact[] = [];
        const vcards = content.split('END:VCARD');

        for (const vcard of vcards) {
            if (!vcard.trim()) continue;

            const lines = vcard.split('\n');
            let displayName = 'Unknown';
            const phones: Array<{ name: string; number: string }> = [];
            const emails: Array<{ label: string; email: string }> = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('FN:')) {
                    displayName = trimmed.substring(3);
                } else if (trimmed.startsWith('TEL')) {
                    const number = trimmed.split(':')[1];
                    if (number) phones.push({ name: 'Mobile', number });
                } else if (trimmed.startsWith('EMAIL')) {
                    const email = trimmed.split(':')[1];
                    if (email) emails.push({ label: 'Email', email });
                }
            }

            if (displayName !== 'Unknown') {
                contacts.push({ displayName, phones, emails });
            }
        }

        return contacts;
    }
}
