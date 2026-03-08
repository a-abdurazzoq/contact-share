import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Contacts & Sync Flow', () => {
    let token: string;
    let contactId: string;

    beforeAll(async () => {
        // Register user
        const authRes = await request(app)
            .post('/v1/auth/register')
            .send({
                email: `contact-test-${Date.now()}@example.com`,
                password: 'TestPassword123!',
                firstName: 'ContactTester',
            });
        token = authRes.body.accessToken;
    });

    describe('Contacts CRUD', () => {
        it('POST /v1/contacts - should create a manual contact', async () => {
            const res = await request(app)
                .post('/v1/contacts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    displayName: 'Manual Contact',
                    tags: ['Friend'],
                    phones: [{ name: 'Mobile', number: '123' }],
                    emails: [{ label: 'Work', email: 'mc@test.com' }],
                })
                .expect(201);

            expect(res.body).toHaveProperty('id');
            contactId = res.body.id;
        });

        it('GET /v1/contacts - should list contacts', async () => {
            const res = await request(app)
                .get('/v1/contacts')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.items.length).toBeGreaterThan(0);
            expect(res.body.items[0].displayName).toBe('Manual Contact');
        });

        it('GET /v1/contacts/:id - should get contact details', async () => {
            const res = await request(app)
                .get(`/v1/contacts/${contactId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.id).toBe(contactId);
            expect(res.body.phones[0].number).toBe('123');
        });

        it('PATCH /v1/contacts/:id - should update contact', async () => {
            const res = await request(app)
                .patch(`/v1/contacts/${contactId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    displayName: 'Updated Name',
                    notes: 'Updated notes',
                })
                .expect(200);

            expect(res.body.displayName).toBe('Updated Name');
        });
    });

    describe('Contact Actions', () => {
        it('POST /v1/contacts/:id/follow - should follow contact', async () => {
            const res = await request(app)
                .post(`/v1/contacts/${contactId}/follow`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.followStatus).toBe('FOLLOWING');
        });

        it('DELETE /v1/contacts/:id/follow - should unfollow contact', async () => {
            const res = await request(app)
                .delete(`/v1/contacts/${contactId}/follow`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.followStatus).toBe('NONE');
        });

        it('POST /v1/contacts/:id/share-tokens - should create share token', async () => {
            const res = await request(app)
                .post(`/v1/contacts/${contactId}/share-tokens`)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);

            expect(res.body).toHaveProperty('token');

            // Verify public access
            await request(app)
                .get(`/v1/contacts/contact-share/${res.body.token}`)
                .expect(200);
        });
    });

    describe('Sync Module', () => {
        it('GET /v1/contacts/linked/updates - should return updates', async () => {
            const res = await request(app)
                .get('/v1/contacts/linked/updates')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body).toHaveProperty('items');
            expect(Array.isArray(res.body.items)).toBe(true);
        });
    });

    describe('Import Module', () => {
        it('POST /v1/contacts/import - should import contacts from CSV', async () => {
            const csvContent = 'name,phone,email\nTest Import,123456,import@test.com';
            const buffer = Buffer.from(csvContent, 'utf-8');

            const res = await request(app)
                .post('/v1/contacts/import')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', buffer, 'contacts.csv')
                .expect(202);

            expect(res.body).toHaveProperty('importId');

            // Check status
            const statusRes = await request(app)
                .get(`/v1/contacts/import/${res.body.importId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(statusRes.body.status).toBeDefined();
        });
    });

    describe('Delete Contact', () => {
        it('DELETE /v1/contacts/:id - should delete contact', async () => {
            await request(app)
                .delete(`/v1/contacts/${contactId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204);

            await request(app)
                .get(`/v1/contacts/${contactId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });
});
