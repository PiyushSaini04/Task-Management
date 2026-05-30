# COMMANDS_REFERENCE.md — Complete Command Reference

> Commands extracted from **TaskFlow** source files: `docker-compose.yml`, `Jenkinsfile`, `.github/workflows/ci.yml`, `package.json`, Dockerfiles, and documentation.  
> **Kubernetes:** not used in this repository; a reference section is included for future deployment.

---

## Table of Contents

1. [Git](#git)
2. [Docker & Docker Compose](#docker--docker-compose)
3. [Jenkins](#jenkins)
4. [Kubernetes (Future / Reference)](#kubernetes-future--reference)
5. [Linux & Shell](#linux--shell)
6. [Frontend Build Tools (npm / Vite)](#frontend-build-tools-npm--vite)
7. [Backend Build Tools (Python / pip)](#backend-build-tools-python--pip)
8. [Testing & Lint Tools](#testing--lint-tools)
9. [Deployment Tools](#deployment-tools)
10. [Quick Command Index](#quick-command-index)

---

## Git

### `git clone <repository-url>`

| Field | Detail |
|-------|--------|
| **Purpose** | Download project source |
| **Parameters** | Repository URL (HTTPS or SSH) |
| **Example** | `git clone https://github.com/user/task-management.git` |
| **Expected result** | New directory with project files |
| **Common errors** | `Permission denied` — fix SSH keys or use HTTPS |
| **Troubleshooting** | Verify URL; use `git clone --depth 1` for shallow clone |

---

### `git status`

| Field | Detail |
|-------|--------|
| **Purpose** | Show modified/untracked files |
| **When used** | Before commit, during viva demo |
| **Expected result** | List of changed files |
| **Common errors** | Not a git repo — run `git init` first |
| **Troubleshooting** | Run inside project root |

---

### `git add <file>` / `git add .`

| Field | Detail |
|-------|--------|
| **Purpose** | Stage changes for commit |
| **Example** | `git add README.md Jenkinsfile` |
| **Expected result** | Files staged (green in `git status`) |
| **Common errors** | Adding `.env` by mistake |
| **Troubleshooting** | Never commit `.env`; verify `.gitignore` |

---

### `git commit -m "message"`

| Field | Detail |
|-------|--------|
| **Purpose** | Record snapshot |
| **Example** | `git commit -m "Add Jenkins pipeline"` |
| **Expected result** | Commit hash printed |
| **Common errors** | Nothing to commit |
| **Troubleshooting** | `git add` first |

---

### `git push origin main`

| Field | Detail |
|-------|--------|
| **Purpose** | Upload commits; triggers GitHub Actions on `main` |
| **Expected result** | Remote branch updated |
| **Common errors** | `rejected` — pull first; auth failure |
| **Troubleshooting** | `git pull --rebase origin main` then push |

---

### `git pull origin main`

| Field | Detail |
|-------|--------|
| **Purpose** | Fetch and merge remote changes |
| **Expected result** | Local branch updated |
| **Common errors** | Merge conflicts |
| **Troubleshooting** | Resolve conflicts in files, then `git add` and `git commit` |

---

## Docker & Docker Compose

### `docker --version`

| Field | Detail |
|-------|--------|
| **Purpose** | Verify Docker installation |
| **Expected result** | e.g. `Docker version 24.x` |
| **Troubleshooting** | Install Docker Desktop |

---

### `docker compose version`

| Field | Detail |
|-------|--------|
| **Purpose** | Verify Compose v2 plugin |
| **Expected result** | `Docker Compose version v2.x` |

---

### `docker compose config`

| Field | Detail |
|-------|--------|
| **Purpose** | Validate and render compose file |
| **Source** | Used during development |
| **Example** | `docker compose config` |
| **Expected result** | Expanded YAML on stdout |
| **Common errors** | YAML syntax error, invalid service reference |
| **Troubleshooting** | Fix line indicated in error message |

---

### `docker compose build`

| Field | Detail |
|-------|--------|
| **Purpose** | Build images for services with `build:` key |
| **Parameters** | `[SERVICE...]` optional service names |
| **Example** | `docker compose build backend frontend` |
| **Expected result** | Images built locally |
| **Common errors** | Dockerfile error, network timeout on `pip install` |
| **Troubleshooting** | `docker compose build --no-cache <service>`; check Dockerfile paths |

---

### `docker compose build --no-cache`

| Field | Detail |
|-------|--------|
| **Purpose** | Force full rebuild without layer cache |
| **Source** | `Jenkinsfile` stage "Build Docker Images" |
| **Example** | `docker compose -f docker-compose.yml -p taskmanager build --no-cache` |
| **Expected result** | Fresh images |
| **Troubleshooting** | Slower build; ensures no stale dependencies |

---

### `docker compose up`

| Field | Detail |
|-------|--------|
| **Purpose** | Create and start containers (foreground logs) |
| **Parameters** | `-d` detach, `--build` rebuild first |
| **Example** | `docker compose up --build` |
| **Expected result** | All services running; logs in terminal |
| **Common errors** | Port already allocated |
| **Troubleshooting** | `docker compose down`; change port in compose file |

---

### `docker compose up -d`

| Field | Detail |
|-------|--------|
| **Purpose** | Start services in background |
| **Source** | `.github/workflows/ci.yml`, Jenkins stage 6 |
| **Example** | `docker compose up --build -d` |
| **Expected result** | Container IDs printed; returns to shell |

---

### `docker compose up -d db backend frontend nginx`

| Field | Detail |
|-------|--------|
| **Purpose** | Start application stack without Jenkins |
| **Source** | `Jenkinsfile` |
| **Expected result** | Four containers running |
| **Troubleshooting** | Ensure `.env` exists |

---

### `docker compose up --build jenkins`

| Field | Detail |
|-------|--------|
| **Purpose** | Build and start only Jenkins service |
| **Source** | README Jenkins setup |
| **Expected result** | Jenkins UI on http://localhost:8080 |

---

### `docker compose ps`

| Field | Detail |
|-------|--------|
| **Purpose** | List containers and status |
| **Expected result** | STATUS `running` or `healthy` |
| **Troubleshooting** | If unhealthy, inspect logs |

---

### `docker compose logs [SERVICE]`

| Field | Detail |
|-------|--------|
| **Purpose** | View container logs |
| **Parameters** | `--tail N`, `-f` follow |
| **Example** | `docker compose logs backend --tail 100 -f` |
| **Expected result** | Uvicorn/Postgres/Nginx log lines |

---

### `docker compose exec -T db pg_isready -U <user> -d <db>`

| Field | Detail |
|-------|--------|
| **Purpose** | Check PostgreSQL readiness |
| **Source** | `Jenkinsfile` health stage |
| **Example** | `docker compose -p taskmanager exec -T db pg_isready -U taskuser -d taskdb` |
| **Expected result** | `accepting connections` exit code 0 |
| **Common errors** | Wrong user/db name |
| **Troubleshooting** | Source `.env` for `POSTGRES_USER` and `POSTGRES_DB` |

---

### `docker compose down`

| Field | Detail |
|-------|--------|
| **Purpose** | Stop and remove containers |
| **Source** | GitHub Actions cleanup, Jenkins failure post |
| **Expected result** | Containers removed; volumes kept by default |

---

### `docker compose down -v --remove-orphans`

| Field | Detail |
|-------|--------|
| **Purpose** | Stop containers, remove volumes and orphan containers |
| **Source** | `Jenkinsfile` Cleanup stage (non-main) |
| **Warning** | **Deletes database data** in `postgres_data` volume |
| **Troubleshooting** | Only use when reset is intentional |

---

### `docker compose -f <file> -p <project> <command>`

| Field | Detail |
|-------|--------|
| **Purpose** | Use alternate compose file and project name |
| **Source** | `Jenkinsfile` (`COMPOSE_FILE`, `COMPOSE_PROJECT_NAME=taskmanager`) |
| **Example** | `docker compose -f docker-compose.yml -p taskmanager up -d` |
| **Expected result** | Isolated container name prefix `taskmanager_*` |

---

### `docker image prune -f`

| Field | Detail |
|-------|--------|
| **Purpose** | Remove unused/dangling images |
| **Source** | `Jenkinsfile` `post.always` |
| **Expected result** | Reclaimed disk space summary |
| **Troubleshooting** | Safe with `\|\| true` if command fails |

---

### `docker logs jenkins`

| Field | Detail |
|-------|--------|
| **Purpose** | View Jenkins container logs (incl. initial admin password) |
| **Example** | `docker logs jenkins \| grep -A 3 "Jenkins initial admin password"` |
| **Expected result** | Password line for first login |

---

## Jenkins

### Access Jenkins UI

| Field | Detail |
|-------|--------|
| **URL** | `http://localhost:8080` |
| **Purpose** | Manage jobs, view builds |
| **Expected result** | Jenkins dashboard |

---

### Blue Ocean

| Field | Detail |
|-------|--------|
| **URL** | `http://localhost:8080/blue` |
| **Purpose** | Visual pipeline view |
| **Plugin** | `blueocean` in `jenkins/plugins.txt` |

---

### Pipeline job configuration (manual)

| Setting | Value |
|---------|-------|
| Job name | `task-management-pipeline` |
| Type | Pipeline |
| Definition | Pipeline script from SCM |
| SCM | Git |
| Script Path | `Jenkinsfile` |
| Branch | `*/main` |

---

### Jenkins pipeline shell commands (inside `Jenkinsfile`)

| Command | Stage |
|---------|-------|
| `cp .env.example .env` | Setup Environment |
| `npm ci` | Lint Frontend |
| `npm run lint` | Lint Frontend |
| `python3 -m venv .venv` | Lint Backend |
| `source .venv/bin/activate && pip install flake8` | Lint Backend |
| `flake8 app --max-line-length=120` | Lint Backend |
| `docker compose ... build --no-cache` | Build Docker Images |
| `docker compose ... up -d db backend frontend nginx` | Start Services |
| `sleep 45` | Start Services |
| `curl --fail --retry ...` | Health Checks / Smoke Tests |
| `cleanWs()` | post cleanup (Groovy) |

---

## Kubernetes (Future / Reference)

> **Not present in this project.** Use when migrating from Docker Compose.

### `kubectl apply -f k8s/`

| Field | Detail |
|-------|--------|
| **Purpose** | Deploy manifests |
| **Expected result** | Resources created |
| **Troubleshooting** | `kubectl describe pod <name>` |

---

### `kubectl get pods`

| Field | Detail |
|-------|--------|
| **Purpose** | List pod status |
| **Expected result** | `Running` for healthy pods |

---

### `kubectl logs <pod-name>`

| Field | Detail |
|-------|--------|
| **Purpose** | View application logs in cluster |

---

### `kubectl port-forward svc/backend 8000:8000`

| Field | Detail |
|-------|--------|
| **Purpose** | Local access to cluster service for debugging |

---

### `helm install taskflow ./chart`

| Field | Detail |
|-------|--------|
| **Purpose** | Install Helm chart (if chart is created later) |

---

## Linux & Shell

### `cp .env.example .env`

| Field | Detail |
|-------|--------|
| **Purpose** | Create environment file |
| **Source** | Setup guides, CI, Jenkins |
| **Windows** | `Copy-Item .env.example .env` |

---

### `set -a && source .env && set +a`

| Field | Detail |
|-------|--------|
| **Purpose** | Export all variables from `.env` to shell |
| **Source** | `Jenkinsfile` health checks |
| **Expected result** | `$POSTGRES_USER` available in same shell |

---

### `sleep 30` / `sleep 45`

| Field | Detail |
|-------|--------|
| **Purpose** | Wait for containers to become ready |
| **Source** | CI (30s), Jenkins (45s) |
| **Troubleshooting** | Increase if slow machine |

---

### `curl [options] <url>`

| Field | Detail |
|-------|--------|
| **Common flags** | `-f` fail on HTTP error, `-s` silent, `-X POST`, `-H "Content-Type: application/json"`, `-d '{}'`, `-w "%{http_code}"` |
| **Source** | CI, Jenkins smoke tests |

---

### `grep -q "pattern" file`

| Field | Detail |
|-------|--------|
| **Purpose** | Assert response contains text |
| **Source** | Jenkins list tasks verification |
| **Example** | `grep -q "Jenkins Smoke Test" /tmp/response.json` |

---

### `python3 -c "import json; ..."`

| Field | Detail |
|-------|--------|
| **Purpose** | Parse task UUID from JSON in smoke tests |
| **Source** | `Jenkinsfile` |

---

## Frontend Build Tools (npm / Vite)

### `npm ci`

| Field | Detail |
|-------|--------|
| **Purpose** | Clean install from `package-lock.json` |
| **Source** | `frontend/Dockerfile`, CI, Jenkins |
| **When used** | CI, Docker build, reproducible installs |
| **Expected result** | `node_modules/` installed |
| **Common errors** | Lockfile out of sync — run `npm install` locally and commit lockfile |
| **Troubleshooting** | Delete `node_modules` and retry |

---

### `npm install`

| Field | Detail |
|-------|--------|
| **Purpose** | Install/update dependencies (local dev) |
| **Difference from `npm ci`** | May update lockfile |

---

### `npm run dev`

| Field | Detail |
|-------|--------|
| **Purpose** | Start Vite development server |
| **Source** | `package.json` scripts |
| **Expected result** | Local URL (typically http://localhost:5173) |
| **Troubleshooting** | Set `VITE_API_BASE_URL` for API access |

---

### `npm run build`

| Field | Detail |
|-------|--------|
| **Purpose** | Production bundle to `dist/` |
| **Source** | `frontend/Dockerfile` build stage |
| **Expected result** | Static assets in `dist/` |
| **Common errors** | ESLint/build errors in code |
| **Troubleshooting** | Fix reported file/line |

---

### `npm run lint`

| Field | Detail |
|-------|--------|
| **Purpose** | Run ESLint on `src/**/*.{js,jsx}` |
| **Source** | `package.json`, CI, Jenkins |
| **Expected result** | Exit 0 if no errors |
| **Common errors** | Unused vars, hook dependency warnings |
| **Troubleshooting** | Fix or adjust `.eslintrc.json` rules |

---

### `npm run preview`

| Field | Detail |
|-------|--------|
| **Purpose** | Preview production build locally |
| **When used** | After `npm run build` |

---

## Backend Build Tools (Python / pip)

### `pip install -r requirements.txt`

| Field | Detail |
|-------|--------|
| **Purpose** | Install FastAPI, SQLAlchemy, asyncpg, etc. |
| **Source** | `backend/Dockerfile` |
| **Expected result** | Packages in container or venv |

---

### `pip install --no-cache-dir -r requirements.txt`

| Field | Detail |
|-------|--------|
| **Purpose** | Smaller Docker layers |
| **Source** | `backend/Dockerfile` |

---

### `python3 -m venv .venv`

| Field | Detail |
|-------|--------|
| **Purpose** | Create isolated Python environment |
| **Source** | Jenkins backend lint stage |

---

### `source .venv/bin/activate` (Linux) / `.venv\Scripts\activate` (Windows)

| Field | Detail |
|-------|--------|
| **Purpose** | Activate virtual environment |

---

### `uvicorn app.main:app --host 0.0.0.0 --port 8000`

| Field | Detail |
|-------|--------|
| **Purpose** | Run FastAPI server |
| **Source** | `backend/Dockerfile` CMD |
| **Local dev** | Add `--reload` for auto-restart |
| **Expected result** | Server on port 8000 |

---

## Testing & Lint Tools

### `flake8 app --max-line-length=120`

| Field | Detail |
|-------|--------|
| **Purpose** | Python style/syntax checks on `backend/app` |
| **Source** | GitHub Actions, Jenkins |
| **Run from** | `backend/` directory (Jenkins) or repo root with path `backend/app` (GHA) |
| **Expected result** | No output = success |
| **Common errors** | E501 line too long, F401 unused import |
| **Troubleshooting** | Fix reported line or refactor |

---

### `curl http://localhost/api/v1/health`

| Field | Detail |
|-------|--------|
| **Purpose** | Verify backend via proxy |
| **Expected result** | `{"status":"ok"}` HTTP 200 |

---

### `curl --fail --retry 5 --retry-delay 5 http://localhost/api/v1/health`

| Field | Detail |
|-------|--------|
| **Purpose** | Health check with retries |
| **Source** | `Jenkinsfile` |

---

### `curl -s -o /tmp/response.json -w "%{http_code}" ...`

| Field | Detail |
|-------|--------|
| **Purpose** | Capture body and status separately |
| **Source** | Jenkins smoke tests |
| **Expected result** | Status in variable; body in file |

---

### Create task (smoke test)

```bash
curl -s -o /tmp/create_response.json -w "%{http_code}" \
  -X POST -H "Content-Type: application/json" \
  -d '{"title": "Jenkins Smoke Test", "description": "Automated test from Jenkins pipeline"}' \
  http://localhost/api/v1/tasks
```

| Field | Detail |
|-------|--------|
| **Expected result** | HTTP `201` |
| **Troubleshooting** | Check backend logs; verify nginx routing |

---

### Update task

```bash
curl -s -o /tmp/response.json -w "%{http_code}" \
  -X PUT -H "Content-Type: application/json" \
  -d '{"status": "completed"}' \
  http://localhost/api/v1/tasks/<TASK_UUID>
```

| Field | Detail |
|-------|--------|
| **Expected result** | HTTP `200` |

---

### Delete task

```bash
curl -s -o /tmp/response.json -w "%{http_code}" \
  -X DELETE \
  http://localhost/api/v1/tasks/<TASK_UUID>
```

| Field | Detail |
|-------|--------|
| **Expected result** | HTTP `204` |

---

## Deployment Tools

### Full local deployment

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
curl http://localhost/api/v1/health
```

| Field | Detail |
|-------|--------|
| **Expected result** | 5 services if Jenkins included; app on :80 |

---

### Stop deployment (preserve data)

```bash
docker compose down
```

---

### Reset deployment (delete DB volume)

```bash
docker compose down -v
```

---

### GitHub Actions (automatic)

| Trigger | Command equivalent |
|---------|-------------------|
| Push to `main` | Runs workflow in `.github/workflows/ci.yml` |
| No local command | View in GitHub → Actions tab |

---

## Quick Command Index

| Task | Command |
|------|---------|
| Start app | `docker compose up --build -d` |
| Stop app | `docker compose down` |
| View logs | `docker compose logs -f backend` |
| Health check | `curl http://localhost/api/v1/health` |
| Lint frontend | `cd frontend && npm run lint` |
| Lint backend | `cd backend && flake8 app --max-line-length=120` |
| Start Jenkins | `docker compose up --build jenkins` |
| Jenkins password | `docker logs jenkins \| grep -A 3 "initial admin password"` |

---

*See also: [README.md](README.md) | [PROCESS.md](PROCESS.md) | [VIVA_QUESTIONS.md](VIVA_QUESTIONS.md)*
