# Contact Share & Sync Backend

Production-ready Node.js + TypeScript backend for a digital business card sharing application with contacts management, QR/link sharing, analytics, and automatic contact sync.

## 🚀 Features

- **Authentication**: JWT-based auth with access + refresh tokens
- **Business Cards**: Full CRUD operations with nested phone/email/social data
- **Share & QR**: Generate shareable links and QR codes for cards
- **Public View**: Anonymous card viewing via share tokens
- **Contact Management**: CRUD, search, tagging, and import from CSV/vCard
- **Activity Analytics**: Track shares, scans, and contact exchanges
- **Auto-Sync**: Follow contacts to receive automatic updates
- **Import**: Bulk import contacts from CSV or vCard files

## 📚 Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **Logging**: Pino
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose

## 🛠️ Prerequisites

- Node.js 20 or higher
- PostgreSQL 16 (or use Docker)
- npm or yarn

## 📦 Installation

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contact-share
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_ACCESS_SECRET`: Random string (min 32 chars)
   - `JWT_REFRESH_SECRET`: Different random string (min 32 chars)
   - `APP_BASE_URL`: Your application URL (e.g., http://localhost:3000)

4. **Run database migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Seed the database (optional)**
   ```bash
   npm run prisma:seed
   ```
   
   This creates a demo user:
   - Email: `demo@example.com`
   - Password: `Password123!`

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Server will be running at http://localhost:3000

### Docker Setup

1. **Start services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start PostgreSQL on port 5432
   - Start the API server on port 3000
   - Run migrations automatically
   - Set up persistent volumes

2. **Access the application**
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health
   - API Docs: http://localhost:3000/docs

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in watch mode
```bash
npm run test:watch
```

## 📖 API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/docs
```

OpenAPI JSON spec:
```
http://localhost:3000/docs.json
```

## 🔑 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) | - | ✅ |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) | - | ✅ |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration | `15m` | ❌ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` | ❌ |
| `PORT` | Server port | `3000` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `APP_BASE_URL` | Application base URL | - | ✅ |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated or *) | `*` | ❌ |

## 📝 Example Usage

### 1. Register a User

```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890"
  }'
```

Response:
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Create a Business Card

```bash
export TOKEN="your-access-token"

curl -X POST http://localhost:3000/v1/cards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "position": "Software Engineer",
    "company": "Tech Corp",
    "bio": "Passionate developer",
    "phones": [
      {"name": "Work", "number": "+1234567890"}
    ],
    "emails": [
      {"label": "Work", "email": "john@techcorp.com"}
    ],
    "socials": [
      {"name": "LinkedIn", "link": "https://linkedin.com/in/johndoe"}
    ],
    "website": "https://johndoe.dev"
  }'
```

### 4. Create a Share Token

```bash
export CARD_ID="card-id-from-previous-step"

curl -X POST http://localhost:3000/v1/cards/$CARD_ID/share-tokens \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "PUBLIC",
    "expiresInSeconds": 2592000
  }'
```

Response:
```json
{
  "token": "abc123...",
  "shareUrl": "http://localhost:3000/s/abc123..."
}
```

### 5. View Public Card (No Auth Required)

```bash
export SHARE_TOKEN="token-from-previous-step"

curl http://localhost:3000/v1/share/$SHARE_TOKEN
```

### 6. Accept Card Share (Create Contact)

```bash
curl -X POST http://localhost:3000/v1/share/$SHARE_TOKEN/accept \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["Work", "Developer"]
  }'
```

### 7. List Your Contacts

```bash
curl http://localhost:3000/v1/contacts \
  -H "Authorization: Bearer $TOKEN"
```

With search and filters:
```bash
curl "http://localhost:3000/v1/contacts?query=john&tag=Work&sort=name&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Get Activity Summary

```bash
curl "http://localhost:3000/v1/cards/$CARD_ID/activity/summary?from=2026-01-01&to=2026-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "cardId": "clx...",
  "range": {
    "from": "2026-01-01T00:00:00.000Z",
    "to": "2026-01-31T23:59:59.999Z"
  },
  "metrics": {
    "sharedContacts": 45,
    "receivedContacts": 12,
    "scanned": 28
  }
}
```

### 9. Sync Linked Contact

```bash
export CONTACT_ID="contact-id"

curl -X POST http://localhost:3000/v1/contacts/$CONTACT_ID/sync \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Import Contacts from CSV

```bash
curl -X POST http://localhost:3000/v1/contacts/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@contacts.csv"
```

Check import status:
```bash
export IMPORT_ID="import-id-from-response"

curl http://localhost:3000/v1/contacts/import/$IMPORT_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 🏗️ Project Structure

```
contact-share/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment validation
│   │   └── logger.ts           # Pino logger setup
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── error-handler.ts   # Global error handler
│   │   └── validation.ts      # Zod validation
│   ├── modules/
│   │   ├── auth/              # Authentication
│   │   ├── profile/           # User profile
│   │   ├── cards/             # Business cards
│   │   ├── share/             # Share tokens & QR
│   │   ├── scan/              # Scan events
│   │   ├── activity/          # Analytics
│   │   ├── contacts/          # Contact management
│   │   ├── sync/              # Contact sync
│   │   └── import/            # Bulk import
│   ├── prisma/
│   │   └── client.ts          # Prisma singleton
│   ├── utils/
│   │   ├── crypto.ts          # Token generation
│   │   ├── errors.ts          # Custom errors
│   │   ├── jwt.ts             # JWT utilities
│   │   └── pagination.ts      # Cursor pagination
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # DB migrations
│   └── seed.ts                # Seed script
├── tests/
│   ├── integration/           # API tests
│   └── unit/                  # Unit tests
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🔒 Security Considerations

- **Passwords**: Hashed with bcrypt (cost factor: 10)
- **Refresh Tokens**: Stored as SHA-256 hashes in database
- **Share Tokens**: Generated with crypto.randomBytes (32 bytes)
- **JWT Secrets**: Must be at least 32 characters in production
- **CORS**: Configure `CORS_ORIGINS` for production
- **Rate Limiting**: Not included in MVP (add with `express-rate-limit`)

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities:

- **users**: User accounts
- **business_cards**: Digital business cards with nested phones/emails/socials
- **contacts**: User's contact list with sync support
- **share_tokens**: Share links for cards and contacts
- **activity_events**: Analytics and tracking
- **refresh_tokens**: JWT refresh token storage
- **imports**: Import job tracking

See `prisma/schema.prisma` for detailed schema.

## 🐛 Troubleshooting

### Database Connection Issues

If you see "Can't reach database server":
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify PostgreSQL port (default: 5432)

### Prisma Migration Errors

Reset the database (⚠️ destroys all data):
```bash
npx prisma migrate reset
```

### Port Already in Use

Change `PORT` in `.env` or kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📜 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@example.com

---

Built with ❤️ using Node.js, TypeScript, and Prisma
