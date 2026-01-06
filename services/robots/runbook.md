# Runbook: Robots Microservice

## Overview
This service provides deterministic `robots.txt` compliance checking for the AMI pipeline.

## Local Development

### 1. Manual Run (Python)
```bash
cd services/robots
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 2. Docker Build & Run
```bash
cd services/robots
docker build -t ami-robots .
docker run -p 8000:8000 ami-robots
```

## API Specification

### POST `/check`
Check if a URL is allow-listed for a specific user-agent.

**Request:**
```json
{
  "url": "https://example.com/page",
  "robots_txt_url": "https://example.com/robots.txt",
  "user_agent": "AMI-Bot"
}
```

**Response:**
```json
{
  "allowed": true,
  "reason": "Parsed robots.txt",
  "matched_rule": null,
  "user_agent": "AMI-Bot",
  "crawl_delay": null
}
```

## Verification
Run the test script:
```bash
python test_robots.py
```
