import { prisma } from '../../prisma/client';
import { NotFoundError } from '../../utils/errors';
import { ScanEventInput } from './scan.schemas';

export class ScanService {
    async recordScanEvent(input: ScanEventInput, actorUserId?: string) {
        // Find the share token
        const shareToken = await prisma.shareToken.findUnique({
            where: { token: input.token },
        });

        if (!shareToken) {
            throw new NotFoundError('Share token');
        }

        // Check expiry
        if (shareToken.expiresAt && shareToken.expiresAt < new Date()) {
            throw new NotFoundError('Share token has expired');
        }

        // Record event
        await prisma.activityEvent.create({
            data: {
                type: 'QR_SCANNED',
                actorUserId,
                targetCardId: shareToken.targetCardId,
                targetContactId: shareToken.targetContactId,
                meta: {
                    token: input.token,
                    source: input.source,
                    deviceId: input.deviceId,
                },
            },
        });

        return { ok: true };
    }
}
