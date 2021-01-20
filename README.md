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
| `HOST`   | `localhost`  | ... |
| `PORT`   | `8080`  | The port the server listens on |
| `DB_URL`   | `...`  | ... |
| `DB_NAME`   | `...`  | ... |
| `ACUITY_API_URL`   | `...`  | ... |
| `ACUITY_API_USER`   | `...`  | ... |
| `ACUITY_API_PASSWORD`   | `...`  | ... |
| `EMAIL_SMTP_HOST`   | `...`  | ... |
| `EMAIL_SMTP_NAME`   | `...`  | ... |
| `EMAIL_SMTP_USERNAME`   | `...`  | ... |
| `EMAIL_SMTP_PASSWORD`   | `...`  | ... |
| `SLACK_API_KEY`   | `...`  | ... |
| `STRIPE_PUBLISHABLE_KEY`   | `...`  | ... |
| `STRIPE_SECRET_KEY`   | `...`  | ... |

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
