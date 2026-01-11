# AMI Dashboard Deployment Proposal
## From Local Dev to Production: Vercel + Supabase

**Prepared for:** CEO & Marketing Head  
**Date:** 11 January 2026  
**Author:** Engineering Team

---

## Executive Summary

The AMI Dashboard is ready for production deployment. We recommend a **Vercel + Supabase** architecture that provides:

- **Zero-ops hosting** — No servers to manage
- **Global edge delivery** — Fast loads worldwide
- **Enterprise-grade security** — SOC2, HIPAA-ready
- **Predictable costs** — ~$45-75/month for our scale

This proposal outlines the migration path, costs, and timeline to get the dashboard live.

---

## Current State

| Component | Today | Production |
|-----------|-------|------------|
| **Frontend** | localhost:3000 | Vercel (vercel.app or custom domain) |
| **Database** | Docker PostgreSQL | Supabase PostgreSQL |
| **Workflows** | Local n8n | Cloud n8n / Supabase Edge Functions |
| **Auth** | None | Supabase Auth (optional) |

---

## Why Vercel + Supabase?

### Vercel (Frontend Hosting)

| Benefit | Details |
|---------|---------|
| **Next.js Native** | Built by the Next.js team — optimal performance |
| **Edge Functions** | API routes run at edge (low latency) |
| **Preview Deploys** | Every PR gets a preview URL |
| **Analytics** | Built-in performance monitoring |
| **Rollbacks** | One-click rollback to any previous deploy |

### Supabase (Backend/Database)

| Benefit | Details |
|---------|---------|
| **Managed Postgres** | Same PostgreSQL we use today |
| **Auto Backups** | Daily backups with point-in-time recovery |
| **Row-Level Security** | Native auth + access control |
| **Realtime** | Live updates (future: live dashboards) |
| **Edge Functions** | Serverless compute for workflows |

---

## Architecture Comparison

### Option A: Vercel + Supabase (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                        USERS                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   VERCEL EDGE                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Next.js    │  │ API Routes  │  │  Analytics  │     │
│  │   App       │  │  (BFF)      │  │             │     │
│  └─────────────┘  └──────┬──────┘  └─────────────┘     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     SUPABASE                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  PostgreSQL │  │    Auth     │  │    Edge     │     │
│  │   (wellness)│  │  (optional) │  │  Functions  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Pros:**
- Fully managed, zero-ops
- Best-in-class Next.js support
- Built-in preview environments
- Global CDN

**Cons:**
- Slight vendor lock-in
- Need to migrate n8n workflows

---

### Option B: Self-Hosted (Current)

```
┌─────────────────────────────────────────────────────────┐
│                   YOUR SERVER / VPS                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Docker     │  │  PostgreSQL │  │    n8n      │     │
│  │  (Next.js)  │  │             │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Pros:**
- Full control
- No vendor dependency
- Data stays on-premise

**Cons:**
- DevOps overhead (backups, security, updates)
- Single point of failure
- Manual scaling

---

## Cost Analysis

### Vercel + Supabase

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| **Vercel** | Pro | $20/seat | 2 seats = $40 |
| **Supabase** | Pro | $25 | 8GB DB, 100K auth users |
| **Domain** | — | $1-2 | ami.yourcompany.com |
| **Total** | — | **~$65-70/month** | |

### Self-Hosted Alternative

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| **DigitalOcean** | Droplet | $24-48 | 4GB-8GB RAM |
| **Managed DB** | — | $15-50 | Optional |
| **DevOps Time** | — | Variable | ~2-4 hrs/month maintenance |
| **Total** | — | **$40-100/month** | + your time |

---

## Security Considerations

### Data Classification

| Data Type | Sensitivity | Notes |
|-----------|-------------|-------|
| Competitor URLs | Low | Publicly crawled |
| Pricing Data | Low | Publicly available |
| Scores/Analysis | Medium | Proprietary insights |
| User Credentials | High | If auth enabled |

### Supabase Security Features

- ✅ **Encryption at rest** — AES-256
- ✅ **Encryption in transit** — TLS 1.3
- ✅ **SOC2 Type II** — Compliant
- ✅ **Row-Level Security** — Restrict data by user
- ✅ **IP Allowlisting** — Restrict database access
- ✅ **HIPAA Ready** — BAA available on Team tier

### Recommended Configuration

```
1. Enable IP allowlisting (Vercel IPs only)
2. Add Row-Level Security policies
3. Enable Supabase Auth for dashboard access
4. Enable 2FA for admin accounts
```

---

## Migration Plan

### Phase 1: Supabase Setup (Day 1)

1. Create Supabase project
2. Run migration scripts (`sql/migrations/*.sql`)
3. Run seed data (`sql/seeds/*.sql`)
4. Test connection from local dashboard

### Phase 2: Data Migration (Day 1-2)

1. Export local PostgreSQL:
   ```bash
   pg_dump -h localhost -U ami_user -d ami_db > ami_backup.sql
   ```
2. Import to Supabase:
   ```bash
   psql -h <supabase-host> -U postgres -d postgres < ami_backup.sql
   ```
3. Verify data integrity

### Phase 3: Vercel Deployment (Day 2)

1. Connect GitHub repo to Vercel
2. Set environment variables:
   - `DATABASE_URL` → Supabase connection string
3. Deploy (automatic on push to main)
4. Verify all 7 pages load correctly

### Phase 4: Domain & DNS (Day 2-3)

1. Add custom domain in Vercel
2. Update DNS records (CNAME → cname.vercel-dns.com)
3. SSL auto-provisioned by Vercel

### Phase 5: n8n Workflows (Day 3-5)

| Option | Approach | Effort |
|--------|----------|--------|
| **A** | n8n Cloud (~$20/month) | Low — re-import workflows |
| **B** | Supabase Edge Functions | Medium — rewrite in TypeScript |
| **C** | Keep local n8n, point to Supabase | Low — update DB connection |

**Recommendation:** Start with Option C (lowest risk), migrate to Option A later.

---

## Timeline

```
┌──────────────────────────────────────────────────────────┐
│  Day 1        │  Day 2        │  Day 3        │ Day 4+  │
├──────────────────────────────────────────────────────────┤
│  Supabase     │  Vercel       │  DNS +        │ Monitor │
│  setup +      │  deploy +     │  Custom       │ + Tune  │
│  data         │  verify       │  domain       │         │
│  migration    │  pages        │               │         │
└──────────────────────────────────────────────────────────┘
```

**Total: 3-4 working days to production**

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Uptime** | 99.9% | Vercel/Supabase status |
| **Page Load** | <2s | Vercel Analytics |
| **DB Response** | <100ms | Supabase dashboard |
| **Deploy Time** | <2min | Vercel builds |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Low | High | Full backup before migration |
| Supabase outage | Very Low | Medium | Built-in HA, consider multi-region |
| Cost overrun | Low | Low | Usage alerts at 80% |
| n8n workflow failure | Medium | Medium | Keep local fallback initially |

---

## Recommendation

> **Deploy to Vercel + Supabase immediately.**
>
> The dashboard is production-ready. This stack provides enterprise-grade reliability with minimal operational overhead. The ~$70/month cost is negligible compared to the engineering time saved.

### Immediate Next Steps

1. **CEO Approval** — Confirm budget for Vercel Pro + Supabase Pro
2. **Create Accounts** — Sign up for Vercel and Supabase
3. **Engineering** — Execute migration (3-4 days)
4. **Go Live** — Share dashboard URL with stakeholders

---

## Appendix

### A. Environment Variables Required

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXT_PUBLIC_BASE_URL=https://ami.yourcompany.com
```

### B. Vercel Project Settings

```
Framework Preset: Next.js
Root Directory: dashboard/
Build Command: npm run build
Output Directory: .next
```

### C. Links

- [Vercel Pricing](https://vercel.com/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase SOC2 Report](https://supabase.com/security)
- [GitHub Repo](https://github.com/joyboy257/ami-awhl)
