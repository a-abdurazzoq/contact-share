import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Activity & Scan Flow', () => {
    let token: string;
    let cardId: string;
    let shareToken: string;

    beforeAll(async () => {
        // Register user
        const authRes = await request(app)
            .post('/v1/auth/register')
            .send({
                email: `activity-test-${Date.now()}@example.com`,
                password: 'TestPassword123!',
                firstName: 'ActivityTester',
            });
        token = authRes.body.accessToken;

        // Create a card
        const cardRes = await request(app)
            .post('/v1/cards')
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: 'Activity', lastName: 'Card' });
        cardId = cardRes.body.id;

        // Create share token
        const tokenRes = await request(app)
            .post(`/v1/cards/${cardId}/share-tokens`)
            .set('Authorization', `Bearer ${token}`)
            .send({ mode: 'PUBLIC' });
        shareToken = tokenRes.body.token;
    });

    describe('Scan Events', () => {
        it('POST /v1/scan/events - should record QR scan', async () => {
            await request(app)
                .post('/v1/scan/events')
                .send({
                    token: shareToken,
                    source: 'QR',
                    deviceId: 'device_123'
                })
                .expect(202);
        });
    });

    describe('Activity Analytics', () => {
        it('GET /v1/cards/:id/activity/summary - should return summary', async () => {
            const res = await request(app)
                .get(`/v1/cards/${cardId}/activity/summary`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.cardId).toBe(cardId);
            expect(res.body.metrics).toHaveProperty('scanned');
            expect(res.body.metrics.scanned).toBeGreaterThanOrEqual(1);
        });

        it('GET /v1/cards/:id/activity/events - should list events', async () => {
            const res = await request(app)
                .get(`/v1/cards/${cardId}/activity/events`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.items.length).toBeGreaterThan(0);
            expect(res.body.items[0].type).toBe('QR_SCANNED');
        });
    });
});
