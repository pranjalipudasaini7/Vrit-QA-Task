# Vrit-QA-Task

# Authorized Partner Registration Automation

A end-to-end QA automation suite that drives the full partner registration flow on [https://authorized-partner.vercel.app/](https://authorized-partner.vercel.app/) using **Playwright Test** with **WebKit** and **TypeScript**. Every test run generates a unique email address via **Mailosaur**, receives a real OTP, fills all multi-step registration forms, uploads a generated SVG document, and submits the application — with zero manual interaction required.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation & Setup](#installation--setup)
3. [Environment Variables](#environment-variables)
4. [Running the Tests](#running-the-tests)
5. [Tech Stack](#tech-stack)
6. [Test Data & Accounts](#test-data--accounts)
7. [File Upload](#file-upload)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before getting started, make sure the following are available on your machine:

- **Node.js 18 or later** — [https://nodejs.org](https://nodejs.org)
- **npm** — bundled with Node.js
- A **Mailosaur account** — [https://mailosaur.com](https://mailosaur.com)
- A **Mailosaur API Key** and a **Mailosaur Server ID** (available from your Mailosaur dashboard)

## Installation & Setup

### 1. Clone the repository

git clone https://github.com/pranjalipudasaini7/Vrit-QA-Task
cd Vrit-QA-Task

### 2. Install dependencies

npm install

### 3. Install the WebKit browser driver

npx playwright install webkit

### 4. Create and configure the `.env` file

Create a `.env` file at the root of the project.

Then open it and add your Mailosaur credentials:

MAILOSAUR_API_KEY=your_mailosaur_api_key
MAILOSAUR_SERVER_ID=your_mailosaur_server_id

Replace `your_mailosaur_api_key` and `your_mailosaur_server_id` with the real values from your Mailosaur dashboard. These values are loaded at runtime by **dotenv** and are never committed to version control.

## Environment Variables

| Variable              | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `MAILOSAUR_API_KEY`   | API key used to authenticate with the Mailosaur service       |
| `MAILOSAUR_SERVER_ID` | Mailosaur server ID that receives OTP emails during test runs |

## Running the Tests

All commands target the main test file `tests/signup.spec.ts` and use the **WebKit** browser project.

### Headed mode (browser window visible)

npx playwright test tests/signup.spec.ts --project=webkit --headed

### Headless mode (default, no browser window)

npx playwright test tests/signup.spec.ts --project=webkit

### Debug mode (step through the test with Playwright Inspector)

npx playwright test tests/signup.spec.ts --project=webkit --debug

### View the HTML test report

npx playwright show-report

## Tech Stack

| Tool / Technology   | Purpose                                                                        |
| ------------------- | ------------------------------------------------------------------------------ |
| **TypeScript**      | Strongly-typed language used to write all test code                            |
| **Playwright Test** | Test runner and end-to-end browser automation framework                        |
| **WebKit**          | Browser driver (Safari engine) supplied and managed by Playwright              |
| **Mailosaur**       | Cloud email service used to receive and read real OTP emails during tests      |
| **dotenv**          | Loads environment variables from the `.env` file into `process.env` at runtime |
| **Node.js 18+**     | JavaScript runtime that executes the test suite                                |

---

## Test Data & Accounts

### Dynamic data (generated per run)

No personal accounts or fixed email addresses are used. All identifying data is generated fresh for each test execution:

| Field                  | Generation Strategy                                                       |
| ---------------------- | ------------------------------------------------------------------------- |
| **Registration email** | `testing-<timestamp>-<parallelIndex>@<MAILOSAUR_SERVER_ID>.mailosaur.net` |
| **Agency email**       | Unique email generated per run                                            |
| **Phone number**       | Derived from the current timestamp                                        |
| **Password**           | `Password.7` (static, meets complexity requirements)                      |

### Static test data

The following values are hardcoded in the test and remain constant across all runs:

| Field               | Value                              |
| ------------------- | ---------------------------------- |
| First Name          | `Testing`                          |
| Last Name           | `Partner`                          |
| Agency Name         | `Testing Agency`                   |
| Role                | `Education Consultant`             |
| Website             | `testingagency.com`                |
| Address             | `Kathmandu, Nepal`                 |
| Country             | `France`                           |
| Years of Experience | `5 years`                          |
| Students Recruited  | `3400`                             |
| Focus Area          | `Undergraduate degree in France`   |
| Success Metrics     | `75`                               |
| Certification       | `ICEF Certified Educational Agent` |

### Registration flow covered

The test automates the complete multi-step registration workflow in the following order:

1. Opens the Authorized Partner website
2. Clicks **Join Us Now**
3. Accepts terms and conditions
4. Fills personal information
5. Generates and fills a unique Mailosaur email address
6. Generates and fills a unique phone number
7. Fills password and confirmation password
8. Waits to receive the OTP email via Mailosaur
9. Extracts the 4–8 digit OTP from the email body
10. Submits the OTP for verification
11. Fills agency details
12. Fills experience details
13. Fills business and certification details
14. Generates and uploads an SVG test document
15. Submits the completed registration

## File Upload

The test does **not** rely on any pre-existing file on disk. Before the upload step, it programmatically generates a temporary SVG document and saves it inside a `test-files/` folder at the project root:

test-files/
└── test-document-<timestamp>.svg

## Troubleshooting

### Missing Mailosaur API key or Server ID

**Symptom:** The test throws an error such as `Cannot read properties of undefined` or `401 Unauthorized` when contacting Mailosaur.

**Fix:** Confirm that the `.env` file exists at the project root and that both `MAILOSAUR_API_KEY` and `MAILOSAUR_SERVER_ID` are set to valid values. Make sure `dotenv` is installed (`npm install -D dotenv`) and that the test file loads it before accessing `process.env`.

### OTP email not received or OTP not found

**Symptom:** The test times out waiting for the OTP email, or the regex fails to extract a code.

**Fix:**

- Verify that the Mailosaur Server ID in `.env` matches the server configured in your Mailosaur dashboard.
- Check the Mailosaur dashboard to confirm the email arrived in the inbox.
- Ensure the generated email address follows the exact format `<prefix>@<MAILOSAUR_SERVER_ID>.mailosaur.net`.
- If the OTP regex expects 4–8 digits, confirm the application email template has not changed its format.

### WebKit browser driver not installed

**Symptom:** Playwright throws `browserType.launch: Executable doesn't exist` or a similar error referencing WebKit.

**Fix:** Run the WebKit installation command:

npx playwright install webkit

If you are on a Linux CI environment, you may also need system dependencies:

npx playwright install-deps webkit

### File upload input selector issue

**Symptom:** The test fails at the upload step with an error such as `locator.setInputFiles: Element is not an <input>` or the selector does not resolve.

**Fix:**

- Open the application in a browser and inspect the file upload element to confirm the selector used in `tests/signup.spec.ts` still matches the current DOM.
- Ensure the `test-files/` directory exists and that the SVG file was successfully generated before the upload step is reached.
- If the upload input is hidden, Playwright's `setInputFiles` can interact with hidden inputs directly; no need to click the element first.
