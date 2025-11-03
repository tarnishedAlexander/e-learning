# E-learning Backend API

Backend API for the E-learning platform built with Node.js, Express, TypeScript, PostgreSQL, and AWS S3.

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (RDS recommended for AWS)
- AWS account with S3 bucket and credentials

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual values:
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

3. **Set up the database:**
   
   Create the database schema:
   ```bash
   npm run db:migrate
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

## API Endpoints

### Courses
- `POST /api/courses` - Create a new course
- `GET /api/courses/professor/:professorId` - Get all courses by professor
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Modules
- `POST /api/courses/:courseId/modules` - Add module to course
- `PUT /api/courses/modules/:moduleId` - Update module
- `DELETE /api/courses/modules/:moduleId` - Delete module

### Lessons
- `POST /api/videos/lessons` - Create a lesson
- `GET /api/videos/lessons/course/:courseId` - Get lessons by course
- `PUT /api/videos/lessons/:lessonId` - Update lesson
- `DELETE /api/videos/lessons/:lessonId` - Delete lesson

### Videos
- `POST /api/videos/upload` - Upload video to S3 (multipart/form-data with 'video' field)

### Professors
- `GET /api/professor/:id` - Get professor by ID
- `GET /api/professor/:id/courses` - Get professor's courses

## Database Schema

The database includes tables for:
- `users` - User accounts
- `professors` - Professor profiles
- `courses` - Course information
- `modules` - Course modules (optional grouping)
- `lessons` - Individual video lessons

## AWS S3 Configuration

Videos are stored in S3 with the following structure:
- Path: `videos/{timestamp}-{filename}`
- The S3 key is stored in the `lessons` table for retrieval

Make sure your AWS credentials have the following permissions:
- `s3:PutObject` - Upload videos
- `s3:GetObject` - Retrieve videos

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations

