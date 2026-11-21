# Team Task API

A secure REST backend for collaborative task tracking. Teams own tasks; only team members can see or work with their team's data.

## Stack

Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, express-validator, and Multer. Attachments are stored locally in `uploads/` for development; use object storage in production.

## Run locally

1. Install Node.js 18+ and start MongoDB.
2. Copy `.env.example` to `.env` and set a long, unique `JWT_SECRET`.
3. Run `npm install` and then `npm run dev`.
4. Confirm the service at `GET http://localhost:3000/health`.

## Authentication

Register with `POST /api/auth/register` using `{ "name", "email", "password" }`. Log in at `POST /api/auth/login`; both return a bearer token. Send it on protected routes:

```http
Authorization: Bearer <token>
```

`POST /api/auth/logout` is intentionally stateless: clients should discard the JWT. For forced server-side revocation, add a token deny-list or short-lived access tokens with refresh-token rotation.

## API overview

| Area | Endpoints |
| --- | --- |
| Profile | `GET/PATCH /api/auth/me`, `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Teams | `GET/POST /api/teams`, `GET /api/teams/:teamId`, `POST /api/teams/:teamId/members`, `DELETE /api/teams/:teamId/members/:userId` |
| Tasks | `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:taskId` |
| Collaboration | `POST /api/tasks/:taskId/comments`, `POST /api/tasks/:taskId/attachments` |

Task creation accepts `title`, `team`, optional `description`, `dueDate`, `assignee`, `priority` (`low`, `medium`, `high`), and `status` (`open`, `in_progress`, `completed`). Team owners can add people who have already registered by email.

### Listing tasks

`GET /api/tasks` returns every task in the caller's teams. Useful query options:

```text
?assignedTo=me&status=open&q=onboarding&sort=dueDate&order=asc
```

Use `team=<teamId>` to narrow the list to one of the caller's teams. Searches title and description. Responses use consistent JSON errors and appropriate HTTP status codes.

### Upload a file

Send a multipart request with the field named `file` to `POST /api/tasks/:taskId/attachments`. The API accepts images, PDFs, and text files up to 10 MB.

## Production notes

- Set `NODE_ENV=production`, restrict CORS to the frontend origin, and terminate HTTPS before deployment.
- Move uploads to S3/GCS or equivalent, apply malware scanning, and use signed download URLs.
- MongoDB should use a managed/private deployment and backed-up credentials. Never commit `.env`.
- Notifications can be added with Socket.IO or SSE around task create/update and assignment events.

## Suggested deployment

Push this public folder to a new GitHub repository, provision MongoDB Atlas, configure the environment variables in your host, then run `npm start`.
