# Publishing to Confluence

## Prerequisites

**1. Atlassian API token**

Create a personal token at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).

**2. `~/.config/mark.toml`**

```toml
username = "your@email.com"
password = "your-api-token"
base-url = "https://your-confluence.atlassian.net/wiki/"
```

**3. Docker running**

The publish script runs `mark` in a container — no local install needed.

## Running

```sh
# Generate C4 diagram images (required before publishing — images are not committed to git)
npm run export:structure-view

# Publish all default sections (technology/, product-outcomes/, users/, service-design/, service-homepage/)
npm run confluence:publish

# Also include delivery-passport/ (only if those Confluence pages are owned by this repo)
npm run confluence:publish:with-delivery-passport

# Publish a single file
node scripts/publish-to-confluence.js path/to/file.md
```

## How markdown files map to Confluence pages

Each `.md` file needs a `mark` header comment so the tool knows where to place it:

```markdown
<!-- Space: ABC -->
<!-- Parent: Service Homepage -->
<!-- Title: Technology -->

# Technology
...
```

`README.md` files without this header are skipped automatically.

Relative markdown links between files are rewritten to Confluence page-title links before publishing — no manual link maintenance needed.
