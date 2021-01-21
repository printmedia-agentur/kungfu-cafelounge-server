<div align="center"><img src="https://printmedia-agentur.de/images/banners/v12.png"></div>

# KungFu Cafelounge Server

<p>
<img src="https://img.shields.io/github/package-json/v/printmedia-agentur/kungfu-cafelounge-server.svg?color=%237d29cc">
</p>

## Configuration

Set the following environment variables

| Variable | Default | Notes                          |
| -------- | ------- | ------------------------------ |
| `NODE_ENV`   | `development`  | The server it's environment |
| `HOST`   | `localhost`  | Define the server it's host |
| `PORT`   | `8080`  | The port the server listens on |
| `DB_URL`   | `...`  | The url of your MongoDB database instance |
| `DB_NAME`   | `...`  | ... |
| `ACUITY_API_URL`   | `...`  | Set the URL for the Acuity Scheduling API |
| `ACUITY_API_USER`   | `...`  | Set the username for the Acuity Scheduling API |
| `ACUITY_API_PASSWORD`   | `...`  | Set the password for the Acuity Scheduling API |
| `EMAIL_SMTP_HOST`   | `smtp.example.com`  | Set the SMTP hostname for sending emails |
| `EMAIL_SMTP_NAME`   | `...`  | Set the senders name for outgoing emails |
| `EMAIL_SMTP_USERNAME`   | `...`  | Set the SMTP username for sending emails |
| `EMAIL_SMTP_PASSWORD`   | `...`  | Set the SMTP password for sending emails |
| `SLACK_API_KEY`   | `...`  | Set Slack API key for outgoing Slack notifications |
| `STRIPE_PUBLISHABLE_KEY`   | `...`  | Set Stripe publishable API key for payments |
| `STRIPE_SECRET_KEY`   | `...`  | Set Stripe secret API key for payments |

## Development

### Branches

<!-- prettier-ignore -->
| Branch    | Tests | Code Coverage | Comments                  |
| --------- | ----- | ------------- | ------------------------- |
| `master`  | ![Build](https://github.com/printmedia-agentur/kungfu-cafelounge-server/workflows/Build/badge.svg) | [![codecov](https://codecov.io/gh/printmedia-agentur/kungfu-cafelounge-server/branch/master/graph/badge.svg)](https://codecov.io/gh/printmedia-agentur/kungfu-cafelounge-server) | Latest Production Release |

### Prerequisites

- [NodeJS](htps://nodejs.org), version 12.13.0 (LTS) or better. (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)

### To build and run locally

Clone this (or better yet, fork it then clone your fork)

```sh
npm install
npm start
```

Go to [localhost:8080/api-docs](http://127.0.0.1:8080/api-docs) to see the docs.

### `.env` file

You can put environment variables in a `.env` file.

### API Documentation

Documentation for the latest current release is at <https://api.kungfu-cafelounge.de/api-docs>.

### Testing

- `npm run test` to run the unit tests
