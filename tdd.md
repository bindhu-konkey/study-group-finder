Technical Design Document (TDD)

Project Name

Study Group Finder

1. Tech Stack

- Frontend: React (Vite)
- Backend: Node.js and Express
- Database: PostgreSQL with Prisma
- Authentication: JWT

2. API Design

Method| Endpoint| Description
POST| "/api/auth/register"| Register user
POST| "/api/auth/login"| Login user
GET| "/api/groups"| View study groups
POST| "/api/groups"| Create study group
POST| "/api/groups/:id/join"| Join a group
DELETE| "/api/groups/:id/leave"| Leave a group

3. Database

The application uses three main tables:

- User
- StudyGroup
- Membership

4. TDD Process

All APIs follow the Red-Green-Refactor cycle.

- Red: Write a failing test.
- Green: Write code to pass the test.
- Refactor: Improve the code.

5. Implementation

Phase 1: Setup database and authentication.

Phase 2: Develop study group APIs.

Phase 3: Build the frontend UI.

Phase 4: Test and deploy the application.
