## Run Locally

1. install yarn
2. run `yarn`
3. create .env file with `VITE_BASE_URL=http://localhost:8000`
4. run `yarn dev` to expose port 3000

## Development Environment

The development environment for the UI is currently deployed to Firebase Hosting. Firebase is also handling user authentication.

Firebase uses a NoSQL database in Firestore.

## Development Pipeline

The pipeline is manually triggered, and is configured in gitlab-ci.yml.

This pipeline currently runs `yarn build` to build the UI artifacts, and then deploys them to the Firebase project.

Firebase uses a firebase.json file for configuration. Importantly, this has a rewrite parameter which sends traffic to the backend URL.

It's also important to make sure this URL is set in the .env.production file in the root folder as VITE_BASE_URL.

## In Progress

Containerizing the UI and deploying on Cloud run.
