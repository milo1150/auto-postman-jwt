# Auto Postman JWT

This project contains a small Playwright test that logs in to your application, extracts the JWT token from the response and updates a variable in a Postman environment using the Postman API.

## Requirements

- Node.js 16 or newer
- A Postman API key
- Access to a running instance of the application under test

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Environment variables

Create an `.env` file in the project root with the following variables:

```bash
USERNAME=admin
PASSWORD=password
POSTMAN_ENV_NAME=automate_jwt
POSTMAN_API_KEY=PMAK-XXXX
POSTMAN_JWT_VARIABLE=auto_jwt
```

`USERNAME` and `PASSWORD` are the credentials used during the login flow. The Postman variables tell the script which environment and variable should receive the new token.

## Running the test

Execute the Playwright test to perform the login and update your Postman environment:

```bash
npx playwright test tests/jwt.spec.ts
```

For continuous execution you can use the provided helper script:

```bash
./jwt.sh
```

The script will rerun the test every few seconds.

## Project structure

- `tests/jwt.spec.ts` – the Playwright test
- `utils/postman.ts` – helper for communicating with the Postman API
- `jwt.sh` – convenience script to repeatedly run the test

