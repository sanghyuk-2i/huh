# Airtable Integration Guide

## Quick Start with Template

Clone the pre-configured Airtable template to get a base with the correct field structure and sample data.

**[Clone Airtable Template](https://airtable.com/TEMPLATE_BASE_ID)**

> After cloning, edit the data and run `huh pull`.

---

## 1. Airtable Base/Table Setup

### Creating a New Base

1. Log in to [Airtable](https://airtable.com).
2. Select **Add a base** > **Start from scratch**.
3. Name the base (e.g., `Error Content`).

### Field (Column) Structure

Create the following fields in your table:

| Field Name | Field Type | Required | Description |
|-----------|-----------|----------|-------------|
| `trackId` | Single line text | **Yes** | Unique error identifier (e.g., `ERR_LOGIN_001`) |
| `type` | Single select | **Yes** | `TOAST`, `MODAL`, `PAGE`, or custom type |
| `message` | Long text | **Yes** | Error message. Supports `{{variable}}` template variables |
| `title` | Single line text | Optional | Error title (used for modal, page) |
| `image` | URL or Single line text | Optional | Error image URL |
| `actionLabel` | Single line text | Optional | Action button text |
| `actionType` | Single select | Optional | `REDIRECT`, `RETRY`, `BACK`, `DISMISS`, or custom action |
| `actionTarget` | URL or Single line text | Optional | URL to navigate to for REDIRECT |

> Adding `TOAST`, `MODAL`, `PAGE`, etc. as Single select options for the `type` field helps prevent input mistakes. Custom types can also be added as options. Even if entered in lowercase, the CLI will automatically convert them to uppercase.

### Example Data

| trackId | type | message | title | actionLabel | actionType | actionTarget |
|---------|------|---------|-------|-------------|------------|--------------|
| ERR_LOGIN_001 | TOAST | Login failed. Please try again. | | Retry | RETRY | |
| ERR_PAYMENT_001 | MODAL | An error occurred during payment processing. | Payment Error | Contact Support | REDIRECT | /support |
| ERR_NOT_FOUND | PAGE | The page you requested could not be found. | Page Not Found | Go Home | REDIRECT | / |
| ERR_NETWORK | TOAST | Please check your network connection. | | Try Again | RETRY | |

## 2. Personal Access Token

1. Go to the [Airtable token page](https://airtable.com/create/tokens).
2. Click **Create new token**.
3. Enter a token name (e.g., `huh-cli`).
4. Under **Scopes**, select `data.records:read`.
5. Under **Access**, select the relevant base.
6. Click **Create token** and copy the token.

> The token is shown only once. Store it in a safe place.

## 3. Finding the Base ID and Table ID

1. Open the relevant base in Airtable.
2. Find them in the browser URL:
   ```
   https://airtable.com/appXXXXXXXXXXXXXX/tblYYYYYYYYYYYYYY/...
                        ^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^
                        Base ID              Table ID
   ```

## 4. Configuration

### Environment Variable (Recommended)

```bash
export AIRTABLE_TOKEN="patXXXXXXXXXXXXXX"
```

### `.huh.config.json` Example

```json
{
  "source": {
    "type": "airtable",
    "baseId": "appXXXXXXXXXXXXXX",
    "tableId": "tblYYYYYYYYYYYYYY"
  },
  "output": "./src/huh.json"
}
```

To specify the token directly in the config:

```json
{
  "source": {
    "type": "airtable",
    "baseId": "appXXXXXXXXXXXXXX",
    "tableId": "tblYYYYYYYYYYYYYY",
    "token": "patXXXXXXXXXXXXXX"
  },
  "output": "./src/huh.json"
}
```

> If you include the token directly in the config file, add `.huh.config.json` to your `.gitignore`.

## 5. Fetching Data

```bash
huh pull
```

If successful, a JSON file will be generated at the `output` path.
