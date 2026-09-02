# GCC Talent Marketplace — Backend

## Overview

GCC Talent Marketplace is a freelance marketplace platform designed to connect clients with freelancers across the GCC region.

This repository contains the **backend REST API** for GCC Talent Marketplace.

The backend is responsible for:

- Authentication and authorization
- User account management
- Freelancer and client profiles
- Job management
- Proposal management
- Contracts and milestones
- Wallet and simulated payment operations
- Reviews and ratings
- File uploads
- Categories and skills
- Administrative operations
- Data validation
- Security and access control
- MongoDB data persistence

The backend communicates with the separate React frontend through a REST API.

---

## Project Purpose

The goal of GCC Talent Marketplace is to provide a platform where:

- Clients can create freelance jobs.
- Freelancers can browse available work.
- Freelancers can submit proposals to jobs.
- Clients can shortlist, decline, or accept proposals.
- Accepted proposals can create contracts.
- Contracts contain milestones for managing work.
- Clients can fund milestones using simulated wallet funds.
- Freelancers can submit milestone deliveries.
- Clients can approve work or request revisions.
- Clients and freelancers can review each other.
- Administrators can manage platform users, categories, skills, and statistics.

This repository is responsible specifically for the **backend API and database layer** of the application.

---

# Tech Stack

## Backend

- Node.js
- Express.js
- JavaScript
- REST API
- MongoDB
- Mongoose

## Authentication & Security

- JSON Web Tokens (JWT)
- bcrypt
- Helmet
- CORS
- Express Rate Limit
- Zod validation
- Request sanitization
- Role-based authorization

## File Handling

- Multer
- Cloudinary

## Testing

- Jest
- Supertest
- mongodb-memory-server

## Development Tools

- Nodemon
- ESLint
- Prettier
- dotenv

---

# Features

## Authentication

- User registration
- User login
- JWT access tokens
- Refresh token support
- Logout
- Password hashing with bcrypt
- Change password
- Retrieve authenticated user
- Update account information
- Authentication rate limiting

---

## Role-Based Authorization

The platform supports three account roles:

### Client

Clients can:

- Manage a client profile
- Create jobs
- Edit jobs
- Publish jobs
- Close and reopen jobs
- Delete draft jobs
- View proposals
- Shortlist proposals
- Decline proposals
- Accept proposals
- Manage contracts
- Create milestones
- Fund milestones
- Approve freelancer deliveries
- Request revisions
- Deposit simulated funds
- Leave reviews

### Freelancer

Freelancers can:

- Create and edit a freelancer profile
- Manage portfolio items
- Browse jobs
- Submit proposals
- Edit proposals
- Withdraw proposals
- View their own proposals
- View contracts
- Deliver milestone work
- Participate in contract communication
- Leave reviews

### Admin

Administrators can:

- View platform statistics
- Search and manage users
- Suspend or activate users
- Verify users
- Delete users
- Create categories
- Update categories
- Delete categories
- Create skills
- Update skills
- Delete skills

---

# Freelancer Profiles

Freelancers can create professional marketplace profiles containing:

- Headline
- Biography
- Skills
- Hourly rate
- Languages
- Availability
- Portfolio items
- Country
- City
- Rating information

Public freelancer profiles can also be retrieved through the API.

---

# Client Profiles

Clients can create profiles containing:

- Company or individual information
- Company name
- Description
- Website
- Country
- City
- Hiring information
- Rating information

Client profiles can also be viewed publicly.

---

# Jobs

Clients can create and manage freelance jobs.

Job functionality includes:

- Create jobs
- Save jobs as drafts
- Publish jobs
- Edit jobs
- Close jobs
- Reopen jobs
- Delete draft jobs
- Browse public jobs
- View job details
- View a client's own jobs
- Associate categories and skills with jobs
- Filter and search available work

---

# Proposals

Freelancers can submit proposals to open jobs.

Proposal functionality includes:

- Submit a proposal
- View personal proposals
- Edit pending proposals
- Withdraw proposals
- View proposals submitted to a client's job
- Shortlist proposals
- Decline proposals
- Accept proposals

Proposal acceptance connects the marketplace hiring process with the contract system.

---

# Contracts & Milestones

Contracts manage the work relationship between a client and freelancer after hiring.

Contract functionality includes:

- View contracts
- View contract details
- Create milestones
- Edit milestones
- Fund milestones
- Submit milestone deliveries
- Approve delivered work
- Request revisions
- Cancel contracts
- Store contract messages
- Maintain contract activity

The contract workflow represents the primary work-delivery process of the marketplace.

---

# Wallet & Simulated Payments

The platform contains a simulated wallet system.

Wallet functionality includes:

- View wallet balance
- View wallet transaction information
- Deposit simulated funds
- Fund contract milestones
- Track financial transactions
- Manage milestone escrow operations
- Apply the configured platform fee

No real payment gateway is required for the project.

---

# Reviews & Ratings

Clients and freelancers can review each other after eligible contracts.

Review functionality includes:

- 1–5 star ratings
- Written review comments
- Contract-linked reviews
- One review per party per contract
- User review history
- Average rating information
- Review count information

Reviews are associated with the user receiving the review.

---

# File Uploads

Authenticated users can upload files through the API.

File handling uses:

- Multer for incoming multipart requests
- Cloudinary for external file storage

The backend returns uploaded file information that can then be stored inside profiles, portfolios, jobs, deliveries, or other supported resources.

---

# Categories & Skills

The backend contains master collections for marketplace categories and skills.

These are used by:

- Freelancer profiles
- Jobs
- Marketplace filtering
- Administrative management

Categories and skills can be viewed publicly and managed by administrators.

---

# Admin System

The administrative API provides tools for managing the marketplace.

Admin functionality includes:

### Platform Statistics

Administrators can retrieve marketplace statistics through the admin API.

### User Management

Administrators can:

- Search users
- View user information
- Update account status
- Verify accounts
- Delete users

### Category Management

Administrators can:

- Create categories
- Update categories
- Delete categories

### Skills Management

Administrators can:

- Create skills
- Update skills
- Delete skills

---

# Application Structure

```text
GCC-Talent-Marketplace/
│
├── controllers/
│   ├── config/
│   ├── admin.js
│   ├── auth.js
│   ├── categories.js
│   ├── clientProfile.js
│   ├── contracts.js
│   ├── freelancerProfiles.js
│   ├── jobs.js
│   ├── proposals.js
│   ├── reviews.js
│   ├── skills.js
│   ├── uploads.js
│   ├── users.js
│   └── wallet.js
│
├── middleware/
│   ├── authorize.js
│   ├── error-handler.js
│   ├── optional-token.js
│   ├── sanitize.js
│   ├── upload.js
│   ├── validate.js
│   └── verify-token.js
│
├── models/
│   ├── category.js
│   ├── clientProfile.js
│   ├── contract.js
│   ├── freelancerProfile.js
│   ├── job.js
│   ├── proposal.js
│   ├── review.js
│   ├── skill.js
│   ├── transaction.js
│   └── user.js
│
├── routes/
│   └── index.js
│
├── services/
│   └── wallet.js
│
├── tests/
│   ├── api.integration.test.js
│   ├── setup.js
│   └── wallet.service.test.js
│
├── utils/
│
├── docs/
│   └── screenshots/
│
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── jest.config.js
├── package.json
├── seed.js
├── server.js
└── README.md
```

---

# Backend Architecture

The backend follows a request-based architecture using Express routes, middleware, controllers, Mongoose models, and supporting services.

```text
React Frontend
      ↓
HTTP Request
      ↓
Express REST API
      ↓
Routes
      ↓
Authentication / Authorization
      ↓
Validation Middleware
      ↓
Controller
      ↓
Service / Business Logic
      ↓
Mongoose Model
      ↓
MongoDB
```

For file uploads:

```text
Client
   ↓
Upload Endpoint
   ↓
Multer
   ↓
Cloudinary
   ↓
Stored File URL
```

---

# API Base URL

All main API endpoints use:

```text
/api/v1
```

For local development:

```text
http://localhost:3000/api/v1
```

---

# Main API Routes

## Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API and database health |

---

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register account |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |

---

## Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get authenticated user |
| PATCH | `/users/me` | Update account |
| PATCH | `/users/me/password` | Change password |
| GET | `/users/:id/reviews` | View reviews received by user |

---

## Freelancer Profiles

| Method | Endpoint | Description |
|---|---|---|
| GET | `/freelancers` | Browse freelancers |
| GET | `/freelancers/:userId` | View freelancer |
| PUT | `/freelancers/me` | Create/update own profile |
| POST | `/freelancers/:id/portfolio` | Add portfolio item |
| PATCH | `/freelancers/:id/portfolio/:portfolioId` | Update portfolio item |
| DELETE | `/freelancers/:id/portfolio/:portfolioId` | Delete portfolio item |

---

## Client Profiles

| Method | Endpoint | Description |
|---|---|---|
| GET | `/clients/me` | View own client profile |
| PUT | `/clients/me` | Create/update client profile |
| GET | `/clients/:userId` | View public client profile |

---

## Jobs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobs` | Browse jobs |
| GET | `/jobs/:jobId` | View job |
| GET | `/jobs/mine` | Client's jobs |
| POST | `/jobs` | Create job |
| PATCH | `/jobs/:jobId` | Update job |
| PATCH | `/jobs/:jobId/publish` | Publish draft |
| POST | `/jobs/:jobId/close` | Close job |
| POST | `/jobs/:jobId/reopen` | Reopen job |
| DELETE | `/jobs/:jobId` | Delete draft |

---

## Proposals

| Method | Endpoint | Description |
|---|---|---|
| POST | `/jobs/:id/proposals` | Submit proposal |
| GET | `/jobs/:id/proposals` | View proposals for job |
| GET | `/proposals/mine` | View freelancer proposals |
| PATCH | `/proposals/:id` | Edit proposal |
| POST | `/proposals/:id/withdraw` | Withdraw proposal |
| POST | `/proposals/:id/shortlist` | Shortlist proposal |
| POST | `/proposals/:id/decline` | Decline proposal |
| POST | `/proposals/:id/accept` | Accept proposal |

---

## Contracts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/contracts` | View contracts |
| GET | `/contracts/:id` | View contract workspace |
| POST | `/contracts/:id/milestones` | Add milestone |
| PATCH | `/contracts/:id/milestones/:mid` | Edit milestone |
| POST | `/contracts/:id/milestones/:mid/fund` | Fund milestone |
| POST | `/contracts/:id/milestones/:mid/deliver` | Deliver milestone |
| POST | `/contracts/:id/milestones/:mid/approve` | Approve milestone |
| POST | `/contracts/:id/milestones/:mid/request-revision` | Request revision |
| POST | `/contracts/:id/cancel` | Cancel contract |
| POST | `/contracts/:id/messages` | Send contract message |

---

## Reviews

| Method | Endpoint | Description |
|---|---|---|
| POST | `/contracts/:id/reviews` | Leave contract review |
| GET | `/users/:id/reviews` | View user reviews |

---

## Wallet

| Method | Endpoint | Description |
|---|---|---|
| GET | `/wallet` | View wallet |
| POST | `/wallet/deposit` | Add simulated funds |

---

## Uploads

| Method | Endpoint | Description |
|---|---|---|
| POST | `/uploads` | Upload file |

---

## Categories & Skills

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | View categories |
| GET | `/skills` | View skills |

---

## Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/stats` | Platform statistics |
| GET | `/admin/users` | Search users |
| GET | `/admin/users/:id` | View user |
| PATCH | `/admin/users/:id/status` | Change user status |
| PATCH | `/admin/users/:id/verify` | Verify user |
| DELETE | `/admin/users/:id` | Delete user |
| POST | `/admin/categories` | Create category |
| PATCH | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |
| POST | `/admin/skills` | Create skill |
| PATCH | `/admin/skills/:id` | Update skill |
| DELETE | `/admin/skills/:id` | Delete skill |

---

# Authentication Flow

Authentication uses JWT access and refresh tokens.

```text
User submits credentials
        ↓
POST /auth/login
        ↓
Backend validates account
        ↓
bcrypt verifies password
        ↓
JWT access token generated
        ↓
Refresh token generated
        ↓
Frontend receives authentication data
        ↓
Protected requests send JWT
        ↓
verify-token middleware
        ↓
req.user becomes available
```

Protected endpoints use authorization middleware to restrict functionality according to the authenticated user's role.

---

# Marketplace Workflow

The primary backend flow is:

```text
Client Registers
       ↓
Client Creates Job
       ↓
Job Published
       ↓
Freelancer Browses Job
       ↓
Freelancer Submits Proposal
       ↓
Client Reviews Proposal
       ↓
Proposal Accepted
       ↓
Contract Created
       ↓
Client Creates/Funds Milestone
       ↓
Freelancer Delivers
       ↓
Client Approves
       ↓
Wallet / Escrow Updated
       ↓
Contract Completed
       ↓
Client & Freelancer Leave Reviews
```

---

# Security

The backend contains several security mechanisms.

## Password Security

Passwords are hashed using bcrypt before being stored.

## JWT Authentication

Protected endpoints require valid authentication.

## Role Authorization

The authorization middleware restricts routes to:

```text
client
freelancer
admin
```

depending on the operation.

## Input Validation

Zod is used to validate request data before controller operations execute.

## Request Sanitization

Incoming data is sanitized to reduce malicious database input.

## CORS

The server accepts requests only from configured frontend origins.

## Helmet

Helmet is enabled to apply additional HTTP security headers.

## Rate Limiting

Authentication routes use rate limiting to reduce brute-force login attempts.

## File Upload Security

Uploads are processed through Multer before being stored through Cloudinary.

## Environment Variables

Sensitive configuration is stored using environment variables rather than being hardcoded into source code.

---

# Environment Variables

Create a `.env` file in the project root.

Example:

```env
NODE_ENV=development

PORT=3000

CLIENT_URL=http://localhost:5173

CLIENT_URLS=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/gcc_talent

JWT_ACCESS_SECRET=replace-with-a-long-random-secret

JWT_ACCESS_EXPIRES=30m

JWT_REFRESH_SECRET=replace-with-another-long-random-secret

JWT_REFRESH_EXPIRES=7d

PLATFORM_FEE_PCT=10

BUILD_SHA=development

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

Never commit the real `.env` file or production secrets to GitHub.

---

# Getting Started

## Prerequisites

Install:

- Node.js 20+
- npm
- Git
- MongoDB

A MongoDB Atlas database may also be used instead of a local MongoDB instance.

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/AliAlaliwat21/GCC-Talent-Marketplace.git
```

## 2. Enter the project directory

```bash
cd GCC-Talent-Marketplace
```

## 3. Install dependencies

```bash
npm install
```

## 4. Create the environment file

Create:

```text
.env
```

Use `.env.example` as the template.

## 5. Start MongoDB

Make sure the configured MongoDB instance is available.

## 6. Start the development server

```bash
npm run dev
```

The default development API will run on:

```text
http://localhost:3000/api/v1
```

---

# Available Scripts

## Development Server

```bash
npm run dev
```

Runs the API using Nodemon.

---

## Production Server

```bash
npm start
```

---

## Run Tests

```bash
npm test
```

---

## Test Coverage

```bash
npm run test:coverage
```

---

## Run ESLint

```bash
npm run lint
```

---

## Format Code

```bash
npm run format
```

---

## Seed Database

```bash
npm run seed
```

The seed script populates the database with demonstration data for development and testing.

---

# Database Models

The current backend contains the following Mongoose models:

```text
User
│
├── FreelancerProfile
│
├── ClientProfile
│
├── Job
│     └── Proposal
│
├── Contract
│     └── Milestones
│
├── Transaction
│
└── Review

Category
│
└── Skill
```

Main collections include:

- Users
- Freelancer Profiles
- Client Profiles
- Jobs
- Proposals
- Contracts
- Transactions
- Reviews
- Categories
- Skills

---

# Testing

Automated backend testing is implemented using:

- Jest
- Supertest
- mongodb-memory-server

Current backend tests include:

```text
tests/
├── api.integration.test.js
├── setup.js
└── wallet.service.test.js
```

API integration testing checks backend endpoint behavior while wallet service testing focuses on the simulated financial logic.

Run:

```bash
npm test
```

or:

```bash
npm run test:coverage
```

---

# API Operation Screenshots

The following section can be used to demonstrate that the backend endpoints operate successfully.

Store screenshots inside:

```text
docs/screenshots/
```

---

## 1. User Registration

**Operation**

```http
POST /api/v1/auth/register
```

Add a screenshot showing a successful user registration request and response.

![User Registration](./docs/screenshots/register.png)

---

## 2. User Login

**Operation**

```http
POST /api/v1/auth/login
```

Add a screenshot showing successful login and JWT authentication.

![User Login](./docs/screenshots/login.png)

---

## 3. Create Job

**Operation**

```http
POST /api/v1/jobs
```

Add a screenshot showing a client successfully creating a job.

![Create Job](./docs/screenshots/create-job.png)

---

## 4. Browse Jobs

**Operation**

```http
GET /api/v1/jobs
```

Add a screenshot showing jobs being returned from MongoDB.

![Browse Jobs](./docs/screenshots/get-jobs.png)

---

## 5. Submit Proposal

**Operation**

```http
POST /api/v1/jobs/:id/proposals
```

Add a screenshot showing a freelancer successfully submitting a proposal.

![Submit Proposal](./docs/screenshots/submit-proposal.png)

---

## 6. Accept Proposal

**Operation**

```http
POST /api/v1/proposals/:id/accept
```

Add a screenshot showing a client accepting a freelancer proposal.

![Accept Proposal](./docs/screenshots/accept-proposal.png)

---

## 7. Contract Created

**Operation**

```http
GET /api/v1/contracts/:id
```

Add a screenshot showing the contract created after the proposal is accepted.

![Contract Created](./docs/screenshots/contract.png)

---

## 8. Fund Milestone

**Operation**

```http
POST /api/v1/contracts/:id/milestones/:mid/fund
```

Add a screenshot showing a milestone being funded from the client's wallet.

![Fund Milestone](./docs/screenshots/fund-milestone.png)

---

## 9. Deliver Milestone

**Operation**

```http
POST /api/v1/contracts/:id/milestones/:mid/deliver
```

Add a screenshot showing a freelancer submitting work for a milestone.

![Deliver Milestone](./docs/screenshots/deliver-milestone.png)

---

## 10. Approve Milestone

**Operation**

```http
POST /api/v1/contracts/:id/milestones/:mid/approve
```

Add a screenshot showing successful approval and wallet/escrow processing.

![Approve Milestone](./docs/screenshots/approve-milestone.png)

---

## 11. Wallet Deposit

**Operation**

```http
POST /api/v1/wallet/deposit
```

Add a screenshot showing simulated funds being added to a client's wallet.

![Wallet Deposit](./docs/screenshots/wallet-deposit.png)

---

## 12. Create Review

**Operation**

```http
POST /api/v1/contracts/:id/reviews
```

Add a screenshot showing a successful review after a contract.

![Create Review](./docs/screenshots/create-review.png)

---

## 13. Admin Statistics

**Operation**

```http
GET /api/v1/admin/stats
```

Add a screenshot showing the administrative statistics response.

![Admin Statistics](./docs/screenshots/admin-stats.png)

---

## 14. Admin User Management

**Operation**

```http
GET /api/v1/admin/users
```

Add a screenshot showing the administrator user-management response.

![Admin Users](./docs/screenshots/admin-users.png)

---

# Example Screenshot Directory

After adding the screenshots, the project can contain:

```text
docs/
└── screenshots/
    ├── register.png
    ├── login.png
    ├── create-job.png
    ├── get-jobs.png
    ├── submit-proposal.png
    ├── accept-proposal.png
    ├── contract.png
    ├── wallet-deposit.png
    ├── fund-milestone.png
    ├── deliver-milestone.png
    ├── approve-milestone.png
    ├── create-review.png
    ├── admin-stats.png
    └── admin-users.png
```

Screenshots may be captured using Postman, Insomnia, Thunder Client, or another REST API client.

Make sure sensitive JWT tokens, passwords, database credentials, and other secrets are hidden before screenshots are committed publicly.

---

# Seed Data

The project includes a database seed script.

Run:

```bash
npm run seed
```

The seed data provides sample marketplace content that can be used to demonstrate:

- Users
- Clients
- Freelancers
- Freelancer profiles
- Categories
- Skills
- Jobs
- Different job statuses
- Marketplace data for development

This allows the application to be demonstrated without manually creating every record.

---

# Error Handling

The backend includes centralized error handling.

Requests that cannot be matched are processed through the not-found handler, while application errors are sent through the central error handler.

Typical API status codes include:

```text
200 - Successful request

201 - Resource created

400 - Invalid request

401 - Authentication required

403 - Forbidden

404 - Resource not found

409 - Resource conflict

422 - Business rule violation

429 - Too many requests

500 - Internal server error
```

---

# Frontend Integration

This backend is designed to communicate with the GCC Talent Marketplace React frontend.

```text
React Frontend
       ↓
Fetch / REST API
       ↓
Express Backend
       ↓
Mongoose
       ↓
MongoDB
```

The frontend sends authenticated requests using JWT credentials.

The `CLIENT_URL` or `CLIENT_URLS` environment variable determines which frontend origins are permitted by CORS.

---

# Current Development Status

The backend currently contains core marketplace functionality for:

- Authentication
- Account management
- Freelancer profiles
- Client profiles
- Portfolio management
- Categories
- Skills
- Jobs
- Job status transitions
- Proposals
- Proposal status management
- Contracts
- Milestones
- Contract delivery workflow
- Contract messages
- Wallet operations
- Simulated milestone funding
- Reviews
- Uploads
- Admin statistics
- Admin user management
- Admin category management
- Admin skills management
- Testing
- Seed data

---

# Future Improvements

Additional functionality and improvements may include:

- Dedicated notification system
- Expanded messaging system
- Gig/service package marketplace
- Dispute management
- Additional wallet transaction endpoints
- Simulated freelancer withdrawals
- Additional automated tests
- Expanded API documentation
- Swagger/OpenAPI interface
- Deployment configuration
- Additional security testing
- Additional admin moderation functionality

---

# Team Project

GCC Talent Marketplace was developed as a full-stack MERN capstone project.

The application is separated into two repositories:

```text
Frontend
React + Vite
        ↓
REST API
        ↓
Backend
Node.js + Express
        ↓
MongoDB
```

This repository represents the **Node.js / Express backend API**.

---

# Contributors

Add the project team members here.

```text
Ali Alaliwat
Husain aljamry
Jassim Alawainati
```

---

# License

This project was created for educational purposes as part of a software engineering capstone project.