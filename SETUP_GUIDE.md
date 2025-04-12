# Local Development Setup Guide

This guide provides instructions on how to set up and run the F6S platform server on your local machine for development purposes.

## Prerequisites

1.  **Node.js and npm (or yarn):** Ensure you have Node.js (which includes npm) installed. You can download it from [nodejs.org](https://nodejs.org/). Alternatively, you can use yarn.
2.  **Git:** Required for cloning the repository.
3.  **Email Account/Service:** You need credentials for an SMTP server to send emails (e.g., Gmail, SendGrid, Mailgun, AWS SES).

## Setup Steps

1.  **Clone the Repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd F6S
    ```

2.  **Install Dependencies:** Navigate to the `server` directory (or the project root if `package.json` is there) and install the required Node.js packages.
    ```bash
    # If package.json is in the root F6S directory
    npm install
    # or
    yarn install

    # If package.json is in the server directory
    cd server
    npm install
    # or
    yarn install
    ```

3.  **Set Up Environment Variables:**
    *   Create a file named `.env` in the `server` directory (`c:\Users\bhumi\OneDrive\Documents\GitHub\F6S\server\.env`).
    *   This file will store sensitive information and configuration settings. **Do not commit this file to Git.** Ensure `.env` is listed in your `.gitignore` file.
    *   Populate the `.env` file with the necessary variables, especially for the email service. See the example below.

4.  **Configure Email Service:**
    *   The application uses Nodemailer to send emails (`server/utils/email.util.js`). You need to provide SMTP server details in the `.env` file.
    *   **Using Gmail (for development only):**
        *   Enable 2-Step Verification for your Google Account.
        *   Generate an "App Password" for Mail on your computer. See Google Help: [Sign in with App Passwords](https://support.google.com/accounts/answer/185833).
        *   Use `smtp.gmail.com` as the host, port `587` (for TLS/STARTTLS) or `465` (for SSL), and your Gmail address and the generated App Password in the `.env` file.
        *   **Note:** Directly using Gmail has limitations and is not recommended for production.
    *   **Using Other Services (SendGrid, Mailgun, AWS SES, etc.):**
        *   Sign up for the service.
        *   Obtain your SMTP credentials (host, port, username, password) from the service provider's dashboard.
        *   Update the `.env` file accordingly.

5.  **Example `.env` File Structure:**
    ```dotenv
    # .env file in the 'server' directory

    # Server Configuration
    PORT=3001 # Or any port your server should run on

    # Database Configuration (Add your specific variables here)
    # DB_HOST=localhost
    # DB_PORT=...
    # DB_USER=...
    # DB_PASSWORD=...
    # DB_NAME=...

    # Email Configuration (Update with your details)
    EMAIL_HOST=smtp.gmail.com       # e.g., smtp.gmail.com, smtp.sendgrid.net
    EMAIL_PORT=587                  # 587 for TLS, 465 for SSL
    EMAIL_SECURE=false              # Use true for port 465, false for 587 (STARTTLS)
    EMAIL_USER=your-email@example.com # Your email address or service username
    EMAIL_PASS=your-app-password-or-api-key # Your email password or App Password/API Key

    # Other configurations (JWT secrets, API keys, etc.)
    # JWT_SECRET=your_very_secret_key
    # ...
    ```

6.  **Run the Server:** Start the application using the script defined in your `package.json` (usually `start` or `dev`).
    ```bash
    # From the directory containing the server's package.json
    npm start
    # or if you have a development script
    npm run dev
    # or using yarn
    yarn start
    yarn dev
    ```

    The server should now be running locally, typically accessible at `http://localhost:PORT` (where `PORT` is the value you set in your `.env` file, e.g., `http://localhost:3001`).

## Troubleshooting

*   **Email Sending Errors:** Double-check your `.env` file for correct `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, and `EMAIL_PASS`. Ensure the port and security settings match your provider's requirements. If using Gmail, confirm 2-Step Verification and App Passwords are set up correctly. Check for firewall issues blocking the connection.
*   **Dependency Issues:** If you encounter errors after `npm install`, try deleting the `node_modules` folder and `package-lock.json` (or `yarn.lock`) and running `npm install` (or `yarn install`) again.
*   **Environment Variables Not Loaded:** Ensure the `.env` file is in the correct directory (usually the `server` directory where it's being loaded, often via a package like `dotenv`) and that the server process is being started from that directory or configured to load it correctly.
