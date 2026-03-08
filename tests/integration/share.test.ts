import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Share Flow', () => {
    let ownerToken: string;
    let recipientToken: string;
    let cardId: string;
    let shareToken: string;

    beforeAll(async () => {
        // Create owner
        const ownerResponse = await request(app)
            .post('/v1/auth/register')
            .send({
                email: `share-owner-${Date.now()}@example.com`,
                password: 'TestPassword123!',
                firstName: 'Owner',
            });
        ownerToken = ownerResponse.body.accessToken;

        // Create recipient
        const recipientResponse = await request(app)
            .post('/v1/auth/register')
            .send({
                email: `share-recipient-${Date.now()}@example.com`,
                password: 'TestPassword123!',
                firstName: 'Recipient',
            });
        recipientToken = recipientResponse.body.accessToken;

        // Create a card
        const cardResponse = await request(app)
            .post('/v1/cards')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
                firstName: 'Share',
                lastName: 'Test',
                position: 'Developer',
                phones: [{ name: 'Work', number: '+1234567890' }],
            });
        cardId = cardResponse.body.id;
    });

    describe('POST /v1/cards/:cardId/share-tokens', () => {
        it('should create a share token', async () => {
            const response = await request(app)
                .post(`/v1/cards/${cardId}/share-tokens`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    mode: 'PUBLIC',
                    expiresInSeconds: 86400,
                })
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('shareUrl');
            shareToken = response.body.token;
        });
    });

    describe('GET /v1/share/:token', () => {
        it('should get public card without auth', async () => {
            const response = await request(app)
                .get(`/v1/share/${shareToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('card');
            expect(response.body.card.firstName).toBe('Share');
        });

        it('should fail with invalid token', async () => {
            await request(app).get('/v1/share/invalid-token').expect(404);
        });
    });

    describe('POST /v1/share/:token/accept', () => {
        it('should accept share and create contact', async () => {
            const response = await request(app)
                .post(`/v1/share/${shareToken}/accept`)
                .set('Authorization', `Bearer ${recipientToken}`)
                .send({
                    tags: ['Work', 'Important'],
                })
                .expect(201);

            expect(response.body).toHaveProperty('contactId');
            expect(response.body).toHaveProperty('linkedCardId');
            expect(response.body.linkedCardId).toBe(cardId);
        });
    });

    describe('GET /v1/cards/:cardId/qr', () => {
        it('should get QR payload', async () => {
            const response = await request(app)
                .get(`/v1/cards/${cardId}/qr`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('payload');
            expect(response.body.payload).toContain('/s/');
        });
    });
});
