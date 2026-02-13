---
title: 'Notion Integration Guide'
description: 'Database setup guide for managing error content in Notion'

---
## Quick Start with Template

Duplicate the pre-configured Notion template to get a database with the correct property structure and sample data.

**[Duplicate Notion Template](https://www.notion.so/sanghyuk2i/Hur-Error-304d49b044d8808194a0fa50b490a6e2)**

::: tip
After duplicating, edit the data and run `huh pull`.
:::

---
### Notion Database Setup

### Creating a New Database

1. Create a new page in Notion.
2. Type `/database` and select **Database - Full page**.
3. Name the database (e.g., `Error Content`).

### Property Structure

Set up the following properties in the database:

| Property Name  | Property Type | Required | Description                                                |
| -------------- | ------------- | -------- | ---------------------------------------------------------- |
| `trackId`      | Title         | **Yes**  | Unique error identifier (e.g., `ERR_LOGIN_001`)            |
| `type`         | Select        | **Yes**  | `TOAST`, `MODAL`, `PAGE`, or custom type                   |
| `message`      | Rich text     | **Yes**  | Error message. Supports `{{variable}}` template variables  |
| `title`        | Rich text     | Optional | Error title (used for modal, page)                         |
| `image`        | URL           | Optional | Error image URL                                            |
| `severity`     | Select        | Optional | `INFO`, `WARNING`, `ERROR`, `CRITICAL`, or custom severity |
| `actionLabel`  | Rich text     | Optional | Action button text                                         |
| `actionType`   | Select        | Optional | `REDIRECT`, `RETRY`, `BACK`, `DISMISS`, or custom action   |
| `actionTarget` | URL           | Optional | URL to navigate to for REDIRECT                            |

::: tip
  In Notion, `trackId` is the default Title property. Rename the default "Name" property to
  `trackId`.
:::

::: tip
  Setting `type`, `severity`, and `actionType` as Select types lets you predefine options to prevent
  input mistakes. Custom types can also be added as options. Even if entered in lowercase, the CLI
  will automatically convert them to uppercase.
:::

### Example Data

| trackId         | type  | message                                      | title          | severity | actionLabel     | actionType | actionTarget |
| --------------- | ----- | -------------------------------------------- | -------------- | -------- | --------------- | ---------- | ------------ |
| ERR_LOGIN_001   | TOAST | Login failed. Please try again.              |                | WARNING  | Retry           | RETRY      |              |
| ERR_PAYMENT_001 | MODAL | An error occurred during payment processing. | Payment Error  | ERROR    | Contact Support | REDIRECT   | /support     |
| ERR_NOT_FOUND   | PAGE  | The page you requested could not be found.   | Page Not Found | INFO     | Go Home         | REDIRECT   | /            |
| ERR_NETWORK     | TOAST | Please check your network connection.        |                | WARNING  | Try Again       | RETRY      |              |

### Creating an Integration and Getting a Token

1. Go to [Notion Integrations](https://www.notion.so/my-integrations).
2. Click **New integration**.
3. Enter an integration name (e.g., `huh-cli`).
4. Select the relevant workspace.
5. Under **Capabilities**, ensure **Read content** is checked.
6. Click **Submit**.
7. Copy the **Internal Integration Secret** (starts with `ntn_` or `secret_`).

### Connecting the Integration to the Database

After creating the integration, you need to connect it to the database:

1. Open the database page in Notion.
2. Click the **...** menu in the top right.
3. Under **Connections** > **Connect to**, select the integration you created.
4. Click **Confirm**.

::: warning
If the integration is not connected, API calls will return a `404` error.
:::

### Finding the Database ID

1. Open the database page in Notion.
2. Find it in the browser URL:
   ```
   https://www.notion.so/workspace/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=...
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    Database ID (32-character hex, no hyphens)
   ```
3. Or extract it from the URL copied via **Share** > **Copy link**.

::: tip
The Database ID can include hyphens or not. The API handles both formats automatically.
:::

### Configuration

### Environment Variable (Recommended)

```bash NOTION_TOKEN="ntn_XXXXXXXXXXXXXXXXXXXX"
```

### `.huh.config.json` Example

```json
{
  "source": {
    "type": "notion",
    "databaseId": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  },
  "output": "./src/huh.json"
}
```

To specify the token directly in the config:

```json
{
  "source": {
    "type": "notion",
    "databaseId": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "token": "ntn_XXXXXXXXXXXXXXXXXXXX"
  },
  "output": "./src/huh.json"
}
```

::: warning
  If you include the token directly in the config file, add `.huh.config.json` to your `.gitignore`.
:::

### Fetching Data

```bash [huh] pull
```

If successful, a JSON file will be generated at the `output` path.

