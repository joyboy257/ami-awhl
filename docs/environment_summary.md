# AMI Environment Summary

This document outlines the standardized development and production environment for the AMI (AWHL Market Intelligence) project.

---

## 🏗️ Architecture Overview

AMI runs as a set of containerized services orchestrated via Docker. This ensures consistency across local development and cloud deployment.

### 📋 Service Map

| Service | Container Name | Image / Port | Role |
| :--- | :--- | :--- | :--- |
| **Database** | `ami-postgres` | `postgres:15` (Port 5432) | Source of Truth (Postgres) |
| **Workflow Engine** | `ami-n8n` | `n8n/n8n` (Port 55000) | Orchestration & Extraction |
| **Robots Service** | `ami-robots-parser` | Custom Python (Port 8005) | `robots.txt` Compliance Worker |

---

## 🗄️ Database (ami-postgres)

The database is the "Source of Truth" for all discovery, crawl, and extraction data.

- **Type**: PostgreSQL 15.15
- **Host (Inside Docker)**: `ami-postgres`
- **Host (From Mac)**: `localhost:5432` (Note: May conflict with local Postgres)
- **Database Name**: `ami_db`
- **User**: `ami_user`
- **Primary Schema**: `wellness`

---

## 🛠️ n8n Integration

n8n is configured to communicate with the database and other services using Docker internal network names.

- **Connection Type**: PostgreSQL
- **Host**: `ami-postgres`
- **Port**: `5432`
- **Database**: `ami_db`
- **Default Schema**: `wellness`

---

## 🔄 Standardization Rules

To maintain environment integrity, follow these rules:

1. **Local-First, Docker-Always**: While code resides on `localhost`, all active pipelines must run against the `ami-postgres` container.
2. **Migrations**: All schema changes must be applied via `sql/migrations/` to the Docker DB.
3. **Credentials**: Never commit plain-text passwords to public repositories. Use the provided JSON templates.

---

## 🚀 Quick Check

To verify the environment is running correctly:

```bash
# Check running containers
docker ps --filter "name=ami"

# Check DB connection
docker exec -it ami-postgres psql -U ami_user -d ami_db -c "SELECT count(*) FROM wellness.verticals;"
```

---

> [!NOTE]
> This environment was standardized on **January 7, 2026**, moving from local Postgres to the `ami-postgres` Docker standard.
