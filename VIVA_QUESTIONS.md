# VIVA_QUESTIONS.md — Interview & Viva Preparation

> Questions and answers based on the **actual TaskFlow codebase**. Each entry includes a **detailed answer** and a **30-second interview answer**.

---

## Table of Contents

1. [Basic Questions](#basic-questions)
2. [Intermediate Questions](#intermediate-questions)
3. [Advanced Questions](#advanced-questions)
4. [Code-Level Questions](#code-level-questions)
5. [Scenario-Based Questions](#scenario-based-questions)
6. [HR + Project Discussion Questions](#hr--project-discussion-questions)

---

## Basic Questions

### Q1. What is the objective of your project?

**Detailed Answer:**  
The project delivers a **containerized task management system** called TaskFlow. Users can create tasks with a title and optional description, mark them as pending or completed, edit them inline, filter the list, and delete them. The system is deployed as multiple Docker containers (PostgreSQL, FastAPI backend, React frontend, Nginx reverse proxy, and optional Jenkins) orchestrated by Docker Compose. It also includes automated CI/CD pipelines that lint code, build images, run health checks, and execute API smoke tests.

**30-Second Answer:**  
“We built TaskFlow—a Docker-based task manager with a React UI, FastAPI API, and PostgreSQL database, plus GitHub Actions and Jenkins for automated testing and deployment validation.”

---

### Q2. What are the main features?

**Detailed Answer:**

- CRUD operations on tasks via REST API and UI
- Status tracking: `pending` and `completed`
- Dashboard statistics (total, pending, completed)
- Client-side filtering (all / pending / completed)
- Inline editing and delete confirmation
- Health check endpoint for monitoring
- Dockerized deployment with one command
- CI/CD: ESLint, Flake8, integration tests, Jenkins smoke tests

**30-Second Answer:**  
“Full task CRUD, filtering, stats, health checks, Docker deployment, and automated lint plus integration testing in GitHub Actions and Jenkins.”

---

### Q3. Which technologies did you use and why?

**Detailed Answer:**

| Layer | Tech | Reason |
|-------|------|--------|
| Frontend | React 18, Vite, Tailwind | Component-based UI, fast builds, modern styling |
| Backend | FastAPI, SQLAlchemy async | Async API, validation, ORM |
| DB | PostgreSQL 15 | Reliable relational data, UUID support |
| Proxy | Nginx | Route `/api` to backend and `/` to frontend |
| DevOps | Docker Compose, GitHub Actions, Jenkins | Reproducible environments and automation |

**30-Second Answer:**  
“React and FastAPI for the stack, PostgreSQL for data, Nginx as reverse proxy, and Docker plus Jenkins/GitHub Actions for deployment and CI.”

---

### Q4. Explain your system architecture in simple terms.

**Detailed Answer:**  
The user opens the browser on `http://localhost`. Traffic hits the **edge Nginx** container on port 80. Requests to `/` go to the **frontend** container (static React app). Requests to `/api/` are forwarded to the **backend** FastAPI service on port 8000. The backend uses **asyncpg** to talk to the **PostgreSQL** container named `db`. Jenkins runs separately on port 8080 and can control Docker on the host to run the same Compose stack during pipelines.

**30-Second Answer:**  
“Nginx is the front door: UI requests go to React, API requests go to FastAPI, and FastAPI reads/writes PostgreSQL—all in Docker containers.”

---

### Q5. How many Docker services are there?

**Detailed Answer:**  
Five services in `docker-compose.yml`: `db`, `backend`, `frontend`, `nginx`, and `jenkins`. The application stack uses four for runtime (excluding Jenkins). Jenkins is the fifth service for CI/CD.

**30-Second Answer:**  
“Five—database, backend, frontend, reverse proxy, and Jenkins.”

---

## Intermediate Questions

### Q6. Explain your database design.

**Detailed Answer:**  
There is one table, `tasks`, defined in `backend/app/models/task.py`:

- `id` — UUID primary key  
- `title` — VARCHAR(255), required  
- `description` — TEXT, optional  
- `status` — VARCHAR(20), default `pending`  
- `created_at`, `updated_at` — timezone-aware timestamps  

Tables are created at startup via `Base.metadata.create_all` in the FastAPI lifespan handler—no separate migration tool is used.

**30-Second Answer:**  
“Single `tasks` table with UUID id, title, description, status, and timestamps—auto-created when the API starts.”

---

### Q7. List your API endpoints.

**Detailed Answer:**

| Method | Path | Status |
|--------|------|--------|
| GET | `/api/v1/health` | 200 |
| GET | `/api/v1/tasks` | 200 |
| POST | `/api/v1/tasks` | 201 |
| PUT | `/api/v1/tasks/{id}` | 200 |
| DELETE | `/api/v1/tasks/{id}` | 204 |

Validation rules: title 1–255 chars, not whitespace-only; description max 1000 chars; status must be `pending` or `completed`.

**30-Second Answer:**  
“Health plus standard REST CRUD on `/api/v1/tasks` with Pydantic validation and proper HTTP status codes.”

---

### Q8. Is authentication implemented?

**Detailed Answer:**  
**No.** The API does not use JWT, sessions, or API keys. CORS is configured via `CORS_ORIGINS` (default `*`). This is acceptable for local/academic demos but must be added before real production (OAuth2, JWT, or API gateway auth).

**30-Second Answer:**  
“Not yet—the API is open; we’d add JWT or OAuth for production.”

---

### Q9. How does Docker Compose orchestrate services?

**Detailed Answer:**  
`docker-compose.yml` defines images/build contexts, environment variables, volumes (`postgres_data`, `jenkins_home`), ports (80, 8080, 5432), and dependencies. Backend waits for DB healthcheck; Nginx waits for backend health and frontend start. Jenkins mounts the Docker socket and project directory for pipelines.

**30-Second Answer:**  
“Compose defines five services with healthchecks, volumes for persistence, and dependency order so the DB is ready before the API and proxy start.”

---

### Q10. What does the Jenkins pipeline do?

**Detailed Answer:**  
The `Jenkinsfile` runs nine stages: Checkout, Setup Environment (copy `.env`), Lint Frontend (UNSTABLE on fail), Lint Backend (UNSTABLE on fail), Build images, Start `db/backend/frontend/nginx`, Health checks (`pg_isready`, curl API and UI), Smoke tests (CRUD via curl), and Cleanup on non-`main` branches. Post-actions prune images and stop stack on failure.

**30-Second Answer:**  
“Jenkins lints, builds Docker images, starts the stack, runs health and full CRUD smoke tests, and cleans up on feature branches.”

---

### Q11. How is CI/CD different between GitHub Actions and Jenkins?

**Detailed Answer:**

| Aspect | GitHub Actions | Jenkins |
|--------|----------------|---------|
| Hosting | GitHub cloud runners | Self-hosted container |
| Trigger | Push/PR to `main` | Manual / SCM poll |
| Lint | Fails job on lint error | Lint → UNSTABLE only |
| Tests | POST + GET verification | Full CRUD smoke tests |
| Cleanup | Always `docker compose down` | `down -v` on non-main |

**30-Second Answer:**  
“GitHub Actions runs on every push with stricter lint; Jenkins runs a longer pipeline with CRUD tests on our own server.”

---

### Q12. How do you test the application?

**Detailed Answer:**

- **Lint:** `npm run lint`, `flake8 app --max-line-length=120`
- **CI integration:** curl health, POST 201, GET 200 with task title in body
- **Jenkins:** create, list, update status, delete with status code assertions
- **Manual:** browser testing of form, filters, edit, delete

**30-Second Answer:**  
“ESLint and Flake8 for code quality, curl-based API tests in CI, and manual UI testing.”

---

### Q13. What security measures exist today?

**Detailed Answer:**

- `.env` gitignored; only `.env.example` committed
- No secrets in `Jenkinsfile` or compose hardcoded for production
- Jenkins docs recommend Credentials plugin for secrets
- Docker socket mounted only to Jenkins (sensitive—must not be public)
- `server_tokens off` in Nginx

**Gaps:** No HTTPS, no auth, default DB password in example env.

**30-Second Answer:**  
“We keep secrets out of Git and document Jenkins credentials, but auth and HTTPS are future work.”

---

## Advanced Questions

### Q14. How would you scale this system?

**Detailed Answer:**

- **Horizontal scaling:** Run multiple backend replicas behind a load balancer; use Kubernetes Deployments and HPA.
- **Database:** Read replicas, connection pooling (PgBouncer), separate write/read paths.
- **Caching:** Redis for frequent GET /tasks (with invalidation on writes).
- **Frontend:** CDN for static assets; separate build per environment.
- **Stateless API:** Already mostly stateless—sessions would go to Redis if auth is added.

**30-Second Answer:**  
“Scale FastAPI replicas behind a load balancer, add Redis caching, use Postgres replicas, and deploy on Kubernetes with autoscaling.”

---

### Q15. How would you optimize performance?

**Detailed Answer:**

- Add DB indexes on `created_at`, `status` if queries grow
- Paginate `GET /tasks` (`limit`/`offset` or cursor)
- Use `select` only needed columns for large lists
- Enable HTTP gzip on Nginx
- Frontend: memoize `TaskCard`, virtualize long lists
- Reduce Docker image size (slim bases, multi-stage builds already used on frontend)

**30-Second Answer:**  
“Pagination, DB indexes, caching, gzip, and React list virtualization for large task volumes.”

---

### Q16. How would you deploy to production?

**Detailed Answer:**

1. Use strong secrets and managed PostgreSQL (RDS, Cloud SQL).
2. HTTPS via Let’s Encrypt or cloud load balancer.
3. Private network for DB—no public 5432.
4. CI promotes tested images to a registry (ECR, GCR).
5. Deploy with Kubernetes or managed container service.
6. Add monitoring (Prometheus/Grafana), backups, and Alembic migrations.

**30-Second Answer:**  
“Managed DB, HTTPS, private networking, container registry, Kubernetes deploy, and proper monitoring and migrations.”

---

### Q17. What happens if the database goes down?

**Detailed Answer:**  
Backend requests depending on `get_db()` will fail with connection errors; health check may fail if it cannot reach DB. Compose marks DB unhealthy; backend may not start on restart until DB recovers. **No automatic failover** in current design. Recovery: restart DB container, restore volume from backup if corrupted.

**30-Second Answer:**  
“The API fails until Postgres is back; Compose healthchecks block dependent services from starting unhealthy.”

---

### Q18. How do you handle failures in CI/CD?

**Detailed Answer:**

- **GitHub Actions:** Failed step fails the job; `docker compose down` runs `if: always()`.
- **Jenkins:** `post.failure` runs `docker compose down`; `catchError` prevents lint from failing entire build; smoke test failure fails the build.
- **Retry:** curl uses `--retry` in health check stage.

**30-Second Answer:**  
“CI fails fast on test errors and tears down containers; Jenkins also cleans up on failure and uses curl retries for health.”

---

### Q19. Explain load balancing in your current setup.

**Detailed Answer:**  
Currently there is **one** Nginx instance and **one** backend instance—no load balancing. Nginx acts as a **reverse proxy**, not a load balancer across multiple backends. To add LB, configure `upstream backend_pool { server backend1; server backend2; }` in Nginx or use cloud LB.

**30-Second Answer:**  
“We have a single reverse proxy today; load balancing would need multiple backend replicas and an upstream block or cloud LB.”

---

### Q20. How is monitoring done?

**Detailed Answer:**  
Docker healthchecks on DB, backend, Jenkins; application `/api/v1/health`; container logs via `docker compose logs`. No Prometheus/Grafana in repo.

**30-Second Answer:**  
“Health endpoints and Docker healthchecks plus logs—full APM would be a future addition.”

---

## Code-Level Questions

### Q21. What does `lifespan` in `main.py` do?

**Detailed Answer:**  
It is an `@asynccontextmanager` passed to FastAPI. On startup, it opens `engine.begin()` and runs `Base.metadata.create_all` to ensure tables exist. On shutdown, the context exits cleanly. This replaces deprecated `@app.on_event("startup")`.

**30-Second Answer:**  
“On startup it creates database tables automatically using SQLAlchemy metadata.”

---

### Q22. What is the purpose of `get_db()`?

**Detailed Answer:**  
`get_db()` in `session.py` is a FastAPI dependency that yields an `AsyncSession` per request and closes it in `finally`. This ensures one session per request and prevents connection leaks.

**30-Second Answer:**  
“It provides a per-request async database session and closes it after the API call.”

---

### Q23. Explain `TaskCreate` vs `TaskUpdate` schemas.

**Detailed Answer:**  
`TaskCreate` extends `TaskBase` with required title and optional description/status defaulting to `pending`. `TaskUpdate` has all optional fields for partial updates; `model_dump(exclude_unset=True)` in the route applies only provided fields.

**30-Second Answer:**  
“Create requires a title; update allows partial changes with optional fields only.”

---

### Q24. Why use `asyncpg` in the connection URL?

**Detailed Answer:**  
SQLAlchemy async engine requires an async driver. `postgresql+asyncpg://` enables non-blocking DB I/O compatible with FastAPI `async def` route handlers.

**30-Second Answer:**  
“asyncpg lets the async FastAPI routes talk to Postgres without blocking the event loop.”

---

### Q25. What does the frontend `Dockerfile` multi-stage build do?

**Detailed Answer:**  
**Stage 1 (node:20-alpine):** `npm ci`, `npm run build` with `VITE_API_BASE_URL`. **Stage 2 (nginx:alpine):** Copies `dist/` to `/usr/share/nginx/html` and uses custom `nginx.conf` for SPA routing.

**30-Second Answer:**  
“Node builds the React app; Nginx serves the static files in a small production image.”

---

### Q26. Explain edge `nginx/nginx.conf` routing.

**Detailed Answer:**  
`location /api/` proxies to `http://backend:8000` with standard headers. `location /` proxies to `http://frontend:80` for the React app. Listens on port 80; `server_tokens off` hides version.

**30-Second Answer:**  
“`/api` goes to FastAPI; everything else goes to the React Nginx container.”

---

### Q27. What is in the `Jenkinsfile` `environment` block?

**Detailed Answer:**  
`COMPOSE_FILE`, `COMPOSE_PROJECT_NAME` (`taskmanager`), `BACKEND_DIR`, `FRONTEND_DIR`, `NODE_VERSION` (`20`), `PYTHON_VERSION` (`3.11`)—used in shell steps for consistent paths and tooling versions.

**30-Second Answer:**  
“Compose file name, project name, and directory/version variables for pipeline steps.”

---

### Q28. What Jenkins plugins are pre-installed?

**Detailed Answer:**  
From `jenkins/plugins.txt`: git, workflow-aggregator, pipeline-stage-view, blueocean, docker-workflow, credentials-binding, ws-cleanup, build-timeout, timestamper, ansicolor. Installed via `jenkins-plugin-cli` in the image build.

**30-Second Answer:**  
“Git, Pipeline, Blue Ocean, Docker workflow, credentials, cleanup, timeout, timestamps, and colored logs.”

---

### Q29. What environment variables does the backend read?

**Detailed Answer:**  
`DATABASE_URL` and `CORS_ORIGINS` via `pydantic-settings` `BaseSettings` with `.env` file support (`app/core/config.py`).

**30-Second Answer:**  
“Database URL and CORS origins from `.env`.”

---

### Q30. Why is `VITE_API_BASE_URL` important?

**Detailed Answer:**  
Vite injects env vars at **build time**. The frontend Axios client uses it as `baseURL`. In Docker, it is set to `http://localhost/api/v1` so browser requests go through the host Nginx, not internal Docker hostnames.

**30-Second Answer:**  
“It tells the React app where the API lives when built into the production bundle.”

---

### Q31. Are there Kubernetes manifests in the project?

**Detailed Answer:**  
**No.** Deployment is Docker Compose only. Kubernetes would be a future migration (Deployments, Services, Ingress, ConfigMaps, Secrets).

**30-Second Answer:**  
“No—we use Docker Compose; Kubernetes would be the next step for cloud scale.”

---

## Scenario-Based Questions

### Q32. What if port 80 is already in use?

**Detailed Answer:**  
`docker compose up` fails to bind nginx port. Identify the process (`netstat` / `ss`), stop it, or change compose mapping to `"8081:80"` and access `http://localhost:8081`. Update curl tests and `VITE_API_BASE_URL` accordingly.

**30-Second Answer:**  
“Stop the conflicting service or change the host port mapping in docker-compose.”

---

### Q33. What if lint fails in Jenkins?

**Detailed Answer:**  
`catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE')` marks the build unstable but continues to build/deploy stages. Review console output for ESLint/Flake8 messages; fix code style before merging to main.

**30-Second Answer:**  
“The build continues but shows UNSTABLE—we fix lint warnings without blocking the whole pipeline.”

---

### Q34. How would you secure the application for production?

**Detailed Answer:**  
Add JWT auth, HTTPS, restrict CORS, strong DB passwords in secrets manager, remove public DB port, rate limiting, input sanitization, security headers in Nginx, regular dependency updates, and scan images with Trivy/Snyk.

**30-Second Answer:**  
“Auth, HTTPS, secret management, no public DB, CORS lockdown, and security scanning.”

---

### Q35. How would you reduce API response time?

**Detailed Answer:**  
Add pagination, DB indexes, connection pool tuning, caching frequent GETs, compress responses, and ensure async queries are not blocked by CPU-bound work in request handlers.

**30-Second Answer:**  
“Pagination, indexes, caching, and keeping handlers truly async.”

---

### Q36. Two developers run Jenkins pipelines simultaneously—what can go wrong?

**Detailed Answer:**  
Both use host Docker and port 80 via project name `taskmanager`—collisions on container names, port bindings, and race conditions on shared test data. Mitigate with unique `COMPOSE_PROJECT_NAME` per job, dynamic ports, or isolated Jenkins agents.

**30-Second Answer:**  
“Port and container conflicts—use unique project names or separate agents per build.”

---

## HR + Project Discussion Questions

### Q37. What was your contribution?

**Detailed Answer (template—customize honestly):**  
Describe your actual work: e.g., backend API design, React components, Docker Compose, Jenkins pipeline, documentation, testing. Mention specific files you authored.

**30-Second Answer:**  
“I worked on [backend/frontend/DevOps]—specifically [API routes / UI components / Jenkinsfile / docker-compose], and integrated the full stack.”

---

### Q38. What was the biggest challenge?

**Detailed Answer:**  
Common valid answers from this project: routing API through Nginx with correct `VITE_API_BASE_URL`; async SQLAlchemy session handling; Jenkins Docker socket permissions; port conflicts during CI; ensuring smoke tests parse UUID from JSON responses.

**30-Second Answer:**  
“Getting Docker networking and the API URL right so the browser could reach FastAPI through Nginx.”

---

### Q39. Did you work in a team? How did you collaborate?

**Detailed Answer:**  
Explain your real setup: Git branches, PR reviews, dividing frontend/backend/DevOps, using GitHub Issues or shared docs. If solo, describe how you used Git and CI as if in a team environment.

**30-Second Answer:**  
“We used Git with feature branches and PRs; I owned [area] while teammates handled [other areas].”

---

### Q40. What would you improve next?

**Detailed Answer:**  
Authentication, Alembic migrations, pytest coverage, Kubernetes deployment, HTTPS, pagination, user roles, and observability stack.

**30-Second Answer:**  
“Add login, database migrations, unit tests, and Kubernetes with HTTPS.”

---

### Q41. Why should we select you based on this project?

**Detailed Answer:**  
Highlight end-to-end ownership: full stack, containers, CI/CD, documentation, ability to explain trade-offs (no auth, auto-create tables), and debugging skills with logs and curl.

**30-Second Answer:**  
“This project shows I can build, deploy, test, and document a production-style system—not just write isolated scripts.”

---

### Q42. How long did the project take?

**Detailed Answer (template):**  
Give your real timeline broken into phases: design (X days), backend (X), frontend (X), Docker (X), CI/CD (X), documentation (X).

**30-Second Answer:**  
“About [N] weeks: core app first, then Docker, then Jenkins and documentation.”

---

*Continue reviewing [README.md](README.md) and [PROCESS.md](PROCESS.md) alongside this file before your viva.*
