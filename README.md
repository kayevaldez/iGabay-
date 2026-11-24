# iGabay

Mental wellness screening and counselor referral support system for the Office of Student Welfare (OGCCS), MSU Naawan.

This repository is the **front end only** (CCC181 final project). It uses sample data that follows the iGabay SRS. There is no back end yet.

**Live site:** _add the Vercel production link here_

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

Password for all: `igabay123`

| Role | Email |
|---|---|
| Student | faithalexa.jabien@msunaawan.edu.ph (also student.b@, student.c@ with no appointments, student.d@ inactive) |
| Kaabag | kaabag.sample@msunaawan.edu.ph |
| Guidance Counselor | kaye.valdez@msunaawan.edu.ph |
| Guidance Associate | sam.dadole@msunaawan.edu.ph |

The sample data is in `src/data/mock.js`. The login page has a "Reset sample data" link.

## Screens and the SRS

| Screen | Requirements |
|---|---|
| Login, role-based access | FR-01, FR-02 |
| Chatbot (Book an appointment, Peer talk) | FR-03, FR-04 |
| Peer talk (student and Kaabag) | FR-05 to FR-09 |
| Well-being assessment | FR-10, FR-11 |
| Appointment form, Select date calendar, review, confirmation | FR-12 to FR-19 |
| Sample Gmail inbox (appointment details, Cancel and Rebook) | FR-20 to FR-24 |
| Counselor appointments, outcome, follow-up | FR-25 to FR-27 |
| Accounts | FR-28 |
| Counselor availability | FR-29 |
| Appointments and absence email | FR-21, FR-30 |
| Analytics and reporting | FR-31 |
| Follow-up contacts | FR-32 |

## Folder guide

- `src/data/mock.js`: sample data
- `src/state.jsx`: app data and actions (sample data kept in the browser session)
- `src/components/`: shared pieces (layout, calendar, notices)
- `src/pages/`: one folder per role
