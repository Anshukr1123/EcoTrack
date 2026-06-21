# Security Policy

We take security seriously at **EcoTrack AI**. If you discover a security vulnerability, we appreciate your help in disclosing it to us responsibly.

---

## Supported Versions

Only the latest active version on the `main` branch receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |

## Reporting a Vulnerability

Please do **NOT** report security vulnerabilities via public GitHub Issues. 

Instead, report vulnerabilities privately by emailing the maintainers or opening a draft security advisory on GitHub.

When reporting, please include:
- A detailed description of the vulnerability.
- Steps to reproduce the issue (including proof-of-concept code where possible).
- The potential impact on users.

We will acknowledge receipt of your report within 48 hours and coordinate a fix release.

## General Security Best Practices for Developers

- **Never Commit Secrets**: Do not check API keys (e.g. `GEMINI_API_KEY`) or environment files (`.env`) into source control. Always verify that `.env` is inside `.gitignore`.
- **Input Sanitation**: Always sanitize and validate user input. Chatbot inputs are stripped of HTML tags using regex before sending to the Gemini API.
- **Escape Outputs**: Render strings using standard React bindings to escape HTML/JS, or use safe markdown rendering components like `react-markdown` without rendering raw HTML.
