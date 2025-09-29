# Ticketly - IT Ticketing System for School Districts

A comprehensive IT support ticketing system designed specifically for school districts, featuring role-based access control for students, teachers, and IT coordinators.

## Features

### 🎯 Role-Based Access Control
- **Students**: Basic ticket creation and viewing
- **Teachers**: Enhanced ticket options and priority settings
- **IT Coordinators**: Full admin panel with ticket management, user oversight, and analytics

### 🎫 Ticket Management
- Create, view, and track support tickets
- Priority levels (Low, Medium, High, Urgent)
- Category classification (Hardware, Software, Network, Other)
- Status tracking (Open, In Progress, Resolved, Closed)
- Real-time updates and comments

### 📊 Admin Dashboard
- Comprehensive analytics and statistics
- User management and oversight
- Ticket assignment and status updates
- System overview and reporting

### 🎨 Modern UI/UX
- Responsive design for all devices
- Intuitive navigation and user experience
- Clean, professional interface
- Real-time notifications and feedback

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **SQL Server** database with localdb support
- **JWT** authentication and authorization
- **RESTful API** design
- **Security** middleware (Helmet, Rate Limiting, CORS)

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Toastify** for notifications
- **Lucide React** for icons

## Database Schema

The system uses the following main tables:
- `Users` - User accounts and roles
### Password storage (migration)

Add a `password_hash` column to the `Users` table for secure password storage using bcrypt.

Run this SQL in your Ticketly database:

```sql
ALTER TABLE Users
ADD password_hash NVARCHAR(255) NULL;

-- Optional: if all existing users will be assigned passwords now,
-- you can enforce NOT NULL afterwards
-- ALTER TABLE Users ALTER COLUMN password_hash NVARCHAR(255) NOT NULL;
```

Notes:
- New registrations will write to `Users.password_hash`.
- Logins verify the submitted password against the stored bcrypt hash.
- Do not store plaintext passwords.

- `Tickets` - Support tickets and metadata
- `Updates` - Ticket comments and status updates
- `Category`, `Priority`, `Status`, `Role` - Lookup tables

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- SQL Server with LocalDB
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticketly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_SERVER=localhost
   DB_DATABASE=Ticketly
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_PORT=1433
   DB_ENCRYPT=true
   DB_TRUST_SERVER_CERTIFICATE=true

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the database**
   - Run the provided SQL script to create the database schema
   - Ensure SQL Server is running and accessible

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

### Getting Started

1. **Register an account** with your role (Student, Teacher, or IT Coordinator)
2. **Create tickets** for IT support requests
3. **Track progress** through the dashboard
4. **Add updates** and comments to tickets
5. **Manage tickets** (IT Coordinators only)

### User Roles

#### Students
- Create and view their own tickets
- Add updates to their tickets
- Basic dashboard with ticket overview

#### Teachers
- All student features
- Enhanced ticket creation options
- Priority setting capabilities

#### IT Coordinators
- Full system access
- Ticket assignment and management
- User administration
- Analytics and reporting
- System configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `GET /api/auth/profile` - User profile

### Tickets
- `GET /api/tickets` - Get all tickets (role-filtered)
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket (IT coordinators only)
- `GET /api/tickets/stats/overview` - Ticket statistics

### Updates
- `GET /api/updates/ticket/:ticketId` - Get ticket updates
- `POST /api/updates` - Add ticket update

### Users
- `GET /api/users` - Get all users (IT coordinators only)
- `GET /api/users/role/:role` - Get users by role
- `GET /api/users/stats/overview` - User statistics

## Security Features

- **JWT Authentication** with secure token handling
- **Role-based authorization** for all endpoints
- **Input validation** and sanitization
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **SQL injection prevention** with parameterized queries

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Ticketly** - Streamlining IT support for educational institutions.
Centralized web application for school district IT professionals so they can efficiently manage IT related tickets with built in AI functionality. Part of Software Development Project 2
Link to Slide Show: https://docs.google.com/presentation/d/1ZpCPlBLZ2uFfdo-yKHcWlJWOu4VhxufJW8ZookIgsCg/edit?usp=sharing
