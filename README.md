# Ticketly - IT Ticketing System for School Districts

A comprehensive IT support ticketing system for school districts with role-based access for Students, Teachers, and IT Coordinators. Includes modern UI, secure API, analytics, and optional Azure AI assistance.

## Features

### 🎯 Role-Based Access Control
- **Students**: Create and view their own tickets
- **Teachers**: All student features plus enhanced ticket options
- **IT Coordinators**: Full admin capabilities (assign, manage, analytics)

### 🎫 Ticket Management
- Create, view, and track tickets
- Priority: Low, Medium, High, Urgent
- Category: Hardware, Software, Network, Other
- Status: Open, In Progress, Resolved, Closed
- Real-time updates and comments

### 📊 Admin Dashboard
- Overview metrics and trends
- User and ticket administration
- Role-based insights and reporting

### 🎨 Modern UI/UX
- Responsive React 18 app
- Tailwind CSS styling
- Toast notifications and accessible components

## Technology Stack

### Backend
- **Node.js 18+** with Express.js
- **SQL Server** (Express/LocalDB/Azure SQL)
- **JWT** authentication & authorization
- **Security**: Helmet, Rate limiting, CORS

### Frontend
- **React 18** (CRA) with hooks
- **React Router v6**
- **Tailwind CSS**
- **Axios**, **React-Toastify**, **Lucide React**

## Database Schema

Main tables:
- `Users` — user accounts and roles (stores `password_hash`)
- `Tickets` — tickets and metadata
- `Updates` — ticket comments/updates
- Lookup tables: `Category`, `Priority`, `Status`, `Role`

### Password storage (migration)
Add a `password_hash` column to `Users` for bcrypt storage if it does not exist.

```sql
ALTER TABLE Users
ADD password_hash NVARCHAR(255) NULL;

-- Optional: enforce NOT NULL after backfilling
-- ALTER TABLE Users ALTER COLUMN password_hash NVARCHAR(255) NOT NULL;
```

Notes:
- Registration writes to `Users.password_hash`.
- Login verifies passwords against the stored bcrypt hash.
- Do not store plaintext passwords.

## Installation & Setup

### Prerequisites
- Node.js 18+
- SQL Server (Express/LocalDB/Azure SQL)
- Git

### Backend setup
1) Install dependencies
```bash
npm install
```

2) Create `.env` in the project root (keys match current code):
```env
# Database
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=Ticketly
DB_USER=your_username
DB_PASSWORD=your_password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Optional: Azure AI (choose ONE of the blocks below)
# -- Azure OpenAI (Cognitive Services)
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
# AZURE_OPENAI_API_KEY=xxxx
# AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
# AZURE_OPENAI_API_VERSION=2024-06-01

# -- Azure AI Foundry (Models-as-a-Service)
# AZURE_MAAS_ENDPOINT=https://your-endpoint
# AZURE_MAAS_KEY=xxxx
# AZURE_MAAS_MODEL=gpt-4.1
# AZURE_MAAS_DEPLOYMENT=optional-deployment-name
```

3) Create the database and tables per the schema above, then ensure SQL Server is running and accessible.

4) Start the backend server
```bash
npm run dev
```

### Frontend setup
From the project root, either:
```bash
npm run client   # starts CRA dev server in /client
```
or run manually:
```bash
cd client && npm install && npm start
```

The app is available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

Dev convenience: the client has a proxy to `http://localhost:5000`, so API calls use relative paths (no extra CORS config for local dev).

## Usage

1) Register an account with a role (Student, Teacher, IT Coordinator)
2) Create tickets for IT support requests
3) Track progress via dashboard
4) Add updates and comments
5) IT Coordinators manage, assign, and analyze

### User Roles
#### Students
- Create and view own tickets; add updates

#### Teachers
- Student capabilities plus richer ticket creation and priority

#### IT Coordinators
- Full system administration, assignment, analytics, reporting

## API Endpoints

### Health
- `GET /api/health` — service status

### Authentication
- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login
- `GET /api/auth/profile` — current user profile
- `GET /api/auth/verify` — token verification

### Tickets
- `GET /api/tickets` — list (role-filtered)
- `GET /api/tickets/:id` — details (role-filtered)
- `POST /api/tickets` — create (Students/Teachers)
- `PUT /api/tickets/:id` — update (IT Coordinators)
- `DELETE /api/tickets/:id` — delete (creator only)
- `GET /api/tickets/stats/overview` — stats (IT Coordinators)

### Updates
- `GET /api/updates/ticket/:ticketId` — list updates (access-checked)
- `POST /api/updates` — add update

### Users (IT Coordinators)
- `GET /api/users` — list users
- `GET /api/users/role/:role` — list by role
- `GET /api/users/stats/overview` — user stats

### AI (optional)
- `POST /api/ai/summarize` — summarize ticket text
- `POST /api/ai/classify` — suggest category/priority

## Security Features
- JWT auth with secure token handling
- Role-based authorization
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Parameterized queries to prevent SQL injection

## Scripts

Root:
- `npm run dev` — start backend with nodemon
- `npm run client` — start frontend (CRA)
- `npm run build` — build frontend (`client/build`)

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add some amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
MIT — see `LICENSE` for details.

## Support
Open an issue or contact the maintainers.

---

**Ticketly** — Streamlining IT support for educational institutions.
Centralized web application for school district IT professionals to manage tickets with optional AI assistance. Part of Software Development Project 2.
Link to Slide Show: https://docs.google.com/presentation/d/1ZpCPlBLZ2uFfdo-yKHcWlJWOu4VhxufJW8ZookIgsCg/edit?usp=sharing
