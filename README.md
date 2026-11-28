# iGabay

Mental wellness screening and counselor referral support system for the Office of Student Welfare (OGCCS), MSU Naawan.

This repository is the **front end only** (CCC181 final project). It uses sample data that follows the iGabay SRS. There is no back end yet.

**Live site:** https://i-gabay.vercel.app

**Team:** Sam D. Dadole, Faith Alexa Jabien, Kaye D. Valdez

## Tools

React.js and CSS (from the SRS), Vite (build tool), React Router (pages), GitHub, GitHub Actions (CI), Vercel (deployment), Docker.

## Run locally

```bash
npm install
npm run dev
```

Open the link it prints (usually http://localhost:5173).

## Run with Docker

Docker Desktop must be running.

```bash
docker build -t igabay .
docker run --rm -p 8080:80 igabay
```

Open http://localhost:8080. The `-p 8080:80` part connects port 8080 on your computer to port 80 inside the container.

## Deployment

- **CI:** `.github/workflows/ci.yml` runs on every push to `main` and on every pull request. It installs packages, lints, and builds.
- **CD:** Vercel is connected to this repository. A pull request gets a preview link. Merging to `main` publishes to production automatically.
- `vercel.json` sends every address to `index.html`, so refreshing an inner page does not give a 404.
- No passwords or keys are stored in the code. Any future settings go in the Vercel dashboard, not in GitHub.

Workflow: feature branch → pull request → green CI check and Vercel preview → merge → production.

## Sample accounts

Password for all: `igabay123`. On the login page, each role button fills in its sample account.

| Role | Email |
|---|---|
| Student | alexa.jabien@msunaawan.edu.ph (also student.c@msunaawan.edu.ph with no appointments, student.d@msunaawan.edu.ph deactivated) |
| Kaabag | kaabag@msunaawan.edu.ph |
| Guidance Counselor | miko.omondang@msunaawan.edu.ph |
| Guidance Associate | sam.dadole@msunaawan.edu.ph |

The sample data is in `src/data/mock.js` (report numbers are in `src/data/analytics.js`). The login page has a "Reset sample data" link. A new account made by the Guidance Associate can sign in with its temporary password; it is kept only in the browser session.

## Screens (from the Figma design)

| Role | Screens |
|---|---|
| Everyone | Login and login error |
| Student | Home, Chat (assessment, appointment form, select date, review, booked), My appointments (empty, cancel confirm, cancelled, counselor unavailable, rebook, review replacement, rescheduled) |
| Kaabag | Peer talks (empty, chat with a student, conversation ended, reconnect to the chatbot) |
| Guidance Counselor | My appointments, Record outcome (assessment answers, follow-up date check), Outcome saved |
| Guidance Associate | Appointments and requests, Appointment details, Send absence email, Email sent, sample email, Accounts (create, deactivate, saved), Counselor availability (add time slot), Follow-up contact, Reports (weekly, monthly, yearly), Well-being scale analytics |

The well-being assessment questions, labels and concerns are placeholders, because the SRS says the approved questions are still pending.

## Folder guide

- `src/data/mock.js`: sample data
- `src/state.jsx`: app data and actions (sample data kept in the browser session)
- `src/components/`: shared pieces (sidebar layout, pop-ups, date picker, charts)
- `src/pages/`: one folder per role
