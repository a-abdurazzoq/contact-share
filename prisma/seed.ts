import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo user
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const user = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            passwordHash,
            phoneNumber: '+998901112233',
            firstName: 'Abdullaziz',
            lastName: 'Abdurazokov',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
        },
    });

    console.log(`✅ Created user: ${user.email}`);

    // Create business card
    const card = await prisma.businessCard.create({
        data: {
            userId: user.id,
            firstName: 'Abdullaziz',
            lastName: 'Abdurazokov',
            position: 'Backend Engineer',
            company: 'Hippo Tech',
            bio: 'Passionate backend developer specializing in Node.js and TypeScript',
            website: 'https://example.com',
            phones: {
                create: [
                    { name: 'Work', number: '+998901112233' },
                    { name: 'Mobile', number: '+998901234567' },
                ],
            },
            emails: {
                create: [{ label: 'Work', email: 'abdullaziz@hippo.com' }],
            },
            socials: {
                create: [
                    { name: 'Telegram', link: 'https://t.me/abdullaziz' },
                    { name: 'LinkedIn', link: 'https://linkedin.com/in/abdullaziz' },
                ],
            },
        },
    });

    console.log(`✅ Created business card: ${card.id}`);

    // Create share token
    const shareToken = await prisma.shareToken.create({
        data: {
            token: 'demo_share_token_12345',
            type: 'CARD',
            mode: 'PUBLIC',
            targetCardId: card.id,
            createdByUserId: user.id,
        },
    });

    console.log(`✅ Created share token: ${shareToken.token}`);
    console.log(
        `   Share URL: http://localhost:3000/s/${shareToken.token}`
    );

    // Create a sample contact
    const contact = await prisma.contact.create({
        data: {
            ownerUserId: user.id,
            displayName: 'John Doe',
            source: 'MANUAL',
            tags: ['Friend', 'Developer'],
            notes: 'Met at tech conference',
            phones: {
                create: [{ name: 'Mobile', number: '+1234567890' }],
            },
            emails: {
                create: [{ label: 'Personal', email: 'john@example.com' }],
            },
        },
    });

    console.log(`✅ Created contact: ${contact.displayName}`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: demo@example.com');
    console.log('   Password: Password123!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
