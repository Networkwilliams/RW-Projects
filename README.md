# Job Dashboard Application

A web-based admin dashboard for managing project jobs, operatives, and monitoring progress. Built with React, Node.js, Express, and SQLite.

## Features

- **Dashboard**: Overview of jobs, operatives, and key statistics
- **Job Management**: Create, edit, and track jobs with status and priority
- **Job Assignment & Dispatch**: Assign jobs to operatives based on skills, location, and availability
- **Operatives Management**: Manage team members with their skills and availability
- **Risk Assessments**: Create and manage risk assessments for jobs
- **Method Statements**: Document work procedures and safety requirements
- **User Management**: Multi-user support with authentication
- **Progress Monitoring**: Track job updates and progress in real-time
- **Data Export**: Export jobs, operatives, risk assessments, and method statements to CSV format for Microsoft SharePoint or Excel

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT
- **Styling**: Custom CSS with blue and white color scheme

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

### 1. Clone or navigate to the project

```bash
cd job-dashboard-app
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

The backend API will start on `http://localhost:3000`

For development with auto-restart:

```bash
npm run dev
```

### Start the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## Default Login Credentials

```
Username: admin
Password: admin123
```

## Exporting Data

The application includes CSV export functionality for all major data types:

### How to Export

1. Navigate to any of the following pages:
   - Jobs
   - Operatives
   - Risk Assessments
   - Method Statements

2. Click the **"📥 Export CSV"** button in the top right corner

3. A CSV file will automatically download to your computer

4. The filename includes the data type and current date (e.g., `jobs_export_2024-02-10.csv`)

### Using Exports with Microsoft SharePoint

The exported CSV files can be easily imported into Microsoft SharePoint:

1. Export the data from the dashboard
2. Open your SharePoint site
3. Go to the list where you want to import the data
4. Select **"Import from CSV"** or open the file in Excel
5. Use Excel to upload to SharePoint Lists

### Filtered Exports

- **Jobs**: Exports respect the status filter (All, Pending, In Progress, Completed)
- Other pages export all current data

### CSV Contents

Each export includes all relevant fields:

- **Jobs**: ID, Title, Description, Client, Location, Status, Priority, Skills, Assigned To, Dates
- **Operatives**: ID, Name, Email, Phone, Skills, Location, Availability
- **Risk Assessments**: ID, Title, Job ID, Hazards, Risks, Control Measures
- **Method Statements**: ID, Title, Job ID, Description, Steps, Equipment, Safety Requirements

## Project Structure

```
job-dashboard-app/
├── backend/
│   ├── server.js              # Express server and API routes
│   ├── database.js            # SQLite database setup and schema
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── jobdashboard.db        # SQLite database (created on first run)
│
└── frontend/
    ├── src/
    │   ├── pages/             # Page components
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Jobs.jsx
    │   │   ├── JobDetail.jsx
    │   │   ├── Operatives.jsx
    │   │   ├── RiskAssessments.jsx
    │   │   ├── MethodStatements.jsx
    │   │   └── Users.jsx
    │   ├── App.jsx            # Main app with routing
    │   ├── api.js             # API service
    │   ├── main.jsx           # React entry point
    │   └── index.css          # Global styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Database Schema

The application uses SQLite with the following tables:

- **users**: Admin users who can access the dashboard
- **operatives**: Field operatives who can be assigned to jobs
- **jobs**: Project jobs with status, priority, and assignments
- **risk_assessments**: Risk assessments linked to jobs
- **method_statements**: Method statements linked to jobs
- **job_updates**: Progress updates for jobs

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job with details
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/updates` - Add job update

### Operatives
- `GET /api/operatives` - Get all operatives
- `POST /api/operatives` - Create operative
- `PUT /api/operatives/:id` - Update operative
- `DELETE /api/operatives/:id` - Delete operative

### Risk Assessments
- `GET /api/risk-assessments` - Get all risk assessments
- `POST /api/risk-assessments` - Create risk assessment
- `PUT /api/risk-assessments/:id` - Update risk assessment
- `DELETE /api/risk-assessments/:id` - Delete risk assessment

### Method Statements
- `GET /api/method-statements` - Get all method statements
- `POST /api/method-statements` - Create method statement
- `PUT /api/method-statements/:id` - Update method statement
- `DELETE /api/method-statements/:id` - Delete method statement

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Configuration

### Backend Environment Variables

Edit `backend/.env` to configure:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**IMPORTANT**: Change the `JWT_SECRET` to a strong random string in production!

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized production files.

### Backend Production

For production, set `NODE_ENV=production` in `.env` and use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name job-dashboard
```

## Deployment

### Local Network Access

To access from other devices on your local network:

1. Find your local IP address (e.g., `192.168.1.100`)
2. Update `frontend/src/api.js` - change `API_URL` to `http://YOUR_IP:3000/api`
3. Start both backend and frontend
4. Access from other devices using `http://YOUR_IP:5173`

### Production Hosting

For production hosting, you can:

1. Deploy backend to a VPS or cloud provider (AWS, DigitalOcean, etc.)
2. Build and deploy frontend to a static hosting service or serve from backend
3. Set up proper domain and SSL certificate
4. Use environment variables for configuration

## Future Enhancements

The application is ready for mobile app integration:

- All API endpoints are RESTful and mobile-ready
- JWT authentication supports mobile apps
- Risk assessments and method statements can be viewed by mobile technicians
- Add mobile-specific endpoints as needed

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use
- Ensure all dependencies are installed: `npm install`
- Check for errors in the console

### Frontend won't connect to backend
- Ensure backend is running on port 3000
- Check `frontend/src/api.js` API_URL is correct
- Check browser console for CORS errors

### Database issues
- Delete `backend/jobdashboard.db` to reset database
- Restart backend to recreate tables

### Login issues
- Use default credentials: admin / admin123
- Check backend logs for authentication errors

## Support

For issues or questions, refer to the application logs or contact your system administrator.

## License

Proprietary - For internal business use only
