import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Auth Flow', () => {
    let accessToken: string;
    let refreshToken: string;
    const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
    };

    describe('POST /v1/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/v1/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body.user.email).toBe(testUser.email);

            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
        });

        it('should fail with duplicate email', async () => {
            await request(app).post('/v1/auth/register').send(testUser).expect(409);
        });

        it('should fail with invalid email', async () => {
            await request(app)
                .post('/v1/auth/register')
                .send({ ...testUser, email: 'invalid-email' })
                .expect(400);
        });
    });

    describe('POST /v1/auth/login', () => {
        it('should login with correct credentials', async () => {
            const response = await request(app)
                .post('/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
        });

        it('should fail with wrong password', async () => {
            await request(app)
                .post('/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword',
                })
                .expect(401);
        });
    });

    describe('POST /v1/auth/refresh', () => {
        it('should refresh access token', async () => {
            const response = await request(app)
                .post('/v1/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
        });

        it('should fail with invalid refresh token', async () => {
            await request(app)
                .post('/v1/auth/refresh')
                .send({ refreshToken: 'invalid-token' })
                .expect(401);
        });
    });

    describe('GET /v1/me', () => {
        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/v1/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.email).toBe(testUser.email);
        });

        it('should fail without token', async () => {
            await request(app).get('/v1/me').expect(401);
        });
    });

    describe('POST /v1/auth/logout', () => {
        it('should logout and invalidate refresh token', async () => {
            await request(app)
                .post('/v1/auth/logout')
                .send({ refreshToken })
                .expect(204);

            // Try to use the same refresh token again
            await request(app)
                .post('/v1/auth/refresh')
                .send({ refreshToken })
                .expect(401);
        });
    });
});
