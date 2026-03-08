import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Cards Flow', () => {
    let accessToken: string;
    let cardId: string;

    beforeAll(async () => {
        // Register and login
        const registerResponse = await request(app)
            .post('/v1/auth/register')
            .send({
                email: `cards-test-${Date.now()}@example.com`,
                password: 'TestPassword123!',
                firstName: 'Cards',
                lastName: 'Tester',
            });

        accessToken = registerResponse.body.accessToken;
    });

    describe('POST /v1/cards', () => {
        it('should create a new business card', async () => {
            const response = await request(app)
                .post('/v1/cards')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    position: 'Software Engineer',
                    company: 'Tech Corp',
                    bio: 'Passionate developer',
                    phones: [{ name: 'Work', number: '+1234567890' }],
                    emails: [{ label: 'Work', email: 'john@techcorp.com' }],
                    socials: [{ name: 'LinkedIn', link: 'https://linkedin.com/in/johndoe' }],
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            cardId = response.body.id;
        });

        it('should fail without authentication', async () => {
            await request(app)
                .post('/v1/cards')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                })
                .expect(401);
        });
    });

    describe('GET /v1/cards', () => {
        it('should list user cards', async () => {
            const response = await request(app)
                .get('/v1/cards')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('items');
            expect(Array.isArray(response.body.items)).toBe(true);
            expect(response.body.items.length).toBeGreaterThan(0);
        });
    });

    describe('GET /v1/cards/:cardId', () => {
        it('should get a specific card', async () => {
            const response = await request(app)
                .get(`/v1/cards/${cardId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.id).toBe(cardId);
            expect(response.body.firstName).toBe('John');
            expect(response.body.phones.length).toBeGreaterThan(0);
        });
    });

    describe('PATCH /v1/cards/:cardId', () => {
        it('should update a card', async () => {
            const response = await request(app)
                .patch(`/v1/cards/${cardId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    bio: 'Updated biography',
                    position: 'Senior Software Engineer',
                })
                .expect(200);

            expect(response.body.bio).toBe('Updated biography');
            expect(response.body.position).toBe('Senior Software Engineer');
        });
    });

    describe('DELETE /v1/cards/:cardId', () => {
        it('should delete a card', async () => {
            await request(app)
                .delete(`/v1/cards/${cardId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(204);

            // Verify card is deleted
            await request(app)
                .get(`/v1/cards/${cardId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });
});
