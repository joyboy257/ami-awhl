# AMI — AWHL Market Intelligence

> **Version 1.0.0** — January 2026

## What is AMI?

AMI is our competitive intelligence platform that gives us a **live, evidence-backed view** of what every wellness competitor in Singapore is doing — their pricing, their marketing tactics, their SEO footprint, and their conversion strategies.

Instead of manually checking competitor websites or relying on gut feelings, AMI automatically:
- **Discovers** all competitor domains from Google search results
- **Crawls** their websites to extract pricing, offers, and CTAs
- **Scores** each competitor on a 0-100 scale across 5 dimensions
- **Alerts** us when competitors make significant changes

The result? **We know what competitors are doing before they know we're watching.**

---

## Dashboard Screenshots

The executive dashboard surfaces the insights that matter:

| Screen | Purpose |
|--------|---------|
| **Home** | 60-second market overview — visibility score, share of voice, threats & opportunities |
| **Market Map** | Full competitor table — sortable, filterable, one-click deep-dive |
| **Battlecards** | Individual competitor profiles — score breakdown, CTAs, pricing evidence |
| **Offers & Pricing** | Price distribution charts, trial offer leaderboard, CTA mix analysis |
| **Keywords & SERP** | Which keywords we're winning, which we're losing |
| **Change Radar** | Real-time feed of competitor changes this week |
| **Data Health** | Pipeline status so we know our data is fresh |

---

## Why We Built This

Before AMI, competitive intelligence was:
- **Manual** — Someone had to visit websites and update spreadsheets
- **Stale** — By the time we noticed changes, competitors had moved on
- **Incomplete** — We couldn't track dozens of competitors across hundreds of pages
- **Opaque** — No evidence, just hunches

Now it's:
- **Automated** — Pipelines run daily without human intervention
- **Fresh** — Data updates within 24 hours of competitor changes
- **Comprehensive** — We track every competitor, every page, every offer
- **Evidence-first** — Every insight links back to the source

---

## How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   DISCOVER   │ ──▶ │    CRAWL     │ ──▶ │   EXTRACT    │
│  (Google +   │     │  (Websites)  │     │  (AI + SQL)  │
│  Sitemaps)   │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   DASHBOARD  │ ◀── │    SCORE     │ ◀── │   NORMALIZE  │
│  (Next.js)   │     │  (0-100)     │     │  (Clean DB)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

**8 automated workflows** power the system:
1. **W-1** — Build search queries from verticals + services
2. **W-2** — Run SERP snapshots to find competitors
3. **W-3** — Discover sitemaps and pages per domain
4. **W-4** — Crawl pages and store content
5. **W-5** — Extract SEO signals and keywords
6. **W-6** — Extract commercial facts (pricing, offers, CTAs)
7. **W-7** — Score competitors on 5 dimensions
8. **W-8** — Monitor for changes and expand discovery

---

## Technology Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Database** | PostgreSQL | Robust, proven, SQL-friendly |
| **Workflows** | n8n | Visual, self-hosted, no-code automation |
| **Dashboard** | Next.js 14 + Tailwind | Modern, fast, type-safe |
| **Hosting** | Vercel + Supabase (proposed) | Zero-ops, global edge |

---

## What's Next

### Near-term
- [ ] Deploy to Vercel + Supabase (see `docs/deployment-proposal.md`)
- [ ] Add user authentication for dashboard access
- [ ] Set up automated Slack/email alerts for high-severity changes

### Medium-term
- [ ] Expand to Malaysia and Indonesia markets
- [ ] Add historical trend charts (price over time, rank over time)
- [ ] Integrate with our CRM for lead scoring

### Long-term
- [ ] AI-generated competitive briefings
- [ ] Predictive analysis (what will competitors do next?)

---

## Project Structure

```
awhl-market-intel/
├── dashboard/           # Next.js 14 frontend
│   ├── app/             # App Router pages
│   ├── components/      # React components
│   └── lib/             # DB connection, queries
├── n8n/
│   └── workflows/       # W-1 through W-8 JSON exports
├── sql/
│   ├── migrations/      # Schema DDL
│   └── seeds/           # Bootstrap data
├── services/
│   └── robots/          # Robots.txt microservice
├── tests/
│   └── sql/             # Data assertions
└── docs/                # Documentation
```

---

## Getting Started (For Engineering)

```bash
# 1. Clone the repo
git clone https://github.com/joyboy257/ami-awhl.git
cd ami-awhl

# 2. Start database
docker-compose up -d

# 3. Run migrations
psql -f sql/migrations/*.sql

# 4. Start dashboard
cd dashboard && npm install && npm run dev

# 5. Import n8n workflows
# (See n8n/README.md)
```

---

## Contact

**Built by:** Deon & the AWHL Engineering Team  
**Questions?** Reach out on Slack or email.

---

*AMI v1.0.0 — Because knowing your competition is the first step to beating them.*
