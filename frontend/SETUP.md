# Setup Instructions for E-learning Platform

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file with your credentials:**
   ```env
   PORT=3001
   NODE_ENV=development

   # Database Configuration (RDS PostgreSQL)
   DB_HOST=your-rds-endpoint.amazonaws.com
   DB_PORT=5432
   DB_NAME=elearning_db
   DB_USER=postgres
   DB_PASSWORD=your-db-password
   DB_SSL=true

   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-aws-access-key-id
   AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
   AWS_S3_BUCKET_NAME=thetarnisheds3
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3001`

## Frontend Setup

1. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

2. **Create `.env` file in the root directory:**
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:8080`

## Important Notes

- **Database**: Make sure your RDS PostgreSQL instance is running and accessible
- **AWS S3**: Ensure your AWS credentials have proper permissions to upload to the S3 bucket `thetarnisheds3`
- **CORS**: The backend is configured to accept requests from the frontend
- **Video Recording**: The video recorder requires browser permissions for:
  - Screen sharing (for screen capture)
  - Camera (for camera capture)
  - Microphone (for audio recording)

## Features Implemented

### Professor Dashboard
- View all courses created by the professor
- Display course statistics (number of courses, lessons, etc.)
- Navigate to create new courses

### Course Creation
- Create courses with title and description
- Add modules (optional grouping)
- Add lessons with video recording or upload
- Videos are stored locally first, then uploaded to S3 when saving the course
- Support for recording screen, camera, and/or microphone

### Video Recording
- Record screen, camera, and/or microphone simultaneously
- 5-minute maximum recording duration (configurable)
- Real-time preview
- Download recorded videos
- Save videos locally before uploading to S3

### Backend API
- RESTful API for courses, modules, and lessons
- PostgreSQL database integration
- AWS S3 integration for video storage
- Full CRUD operations for all entities

## Next Steps

1. Implement authentication system (currently using localStorage for professor ID)
2. Add video playback functionality for students
3. Add student enrollment functionality
4. Add course editing page
5. Add user management for admin role
6. Add proper error handling and validation

