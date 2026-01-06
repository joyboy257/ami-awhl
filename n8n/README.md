# n8n Workflows

This directory contains n8n workflow definitions for the AMI (AWHL Market Intelligence) project.

## Structure

```
n8n/
├── README.md          # This file
└── workflows/         # n8n workflow JSON exports
```

## Workflow Naming Convention

Workflow files should follow the naming pattern:
- `W-{number}_{short_name}.json` (e.g., `W-1_discovery_dispatcher.json`)

## Usage

1. Export workflows from n8n as JSON
2. Save to the `workflows/` directory with the naming convention above
3. Commit to version control

## Reference

See `docs/pipeline_strategy.md` for workflow architecture and design.
