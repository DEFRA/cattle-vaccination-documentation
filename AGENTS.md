# Instructions for Agents

## Checking the LikeC4 diagrams

Run the following two commands to check the integrity of the LikeC4 diagrams:
- `npm run validate:structure-view`
- `npm run test:structure-view`

## Image Generation

The contents of ./technology/current-state-views/structure-view/images is generated from the LikeC4 diagrams under ./technology/current-state-views/structure-view - the command `npm run export:structure-view` will perform this generation.

## Snapshot for Solution Overview

The contents of ./technology/quality-assurance-view/solution-overview (except ./technology/quality-assurance-view/solution-overview/solution-overview.md) is copied from ./technology/current-state-views/structure-view using the comment `npm run snapshot:solution-overview` so that it can be referenced from ./technology/quality-assurance-view/solution-overview/solution-overview.md

A snapshot will be taken periodically - we won't necessarily want to update the solution overview every time we change the structure view, but ask the question if making changes that could affect it.