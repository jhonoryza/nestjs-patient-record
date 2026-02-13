# nestjs patient record

## Installation

```bash
npm install
```

## Migration

up migration

```bash
npm run migrate core up
```

down migration

```bash
npm run migrate core down
```

example create new migration

```bash
npm run migrate core create -- --name create_users_table.ts
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Generate new module

```bash
# generate new module
nest g module modules/cms/patient
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
