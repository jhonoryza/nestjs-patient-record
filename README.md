# nestjs patient record

## Requirements

- NodeJS 20+
- NestJS 11+

## Installation

```bash
npm install
```

configure .env file

```bash
cp env.example .env
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

## GraphQL

### Queries

#### getHealth
Health check endpoint.

```graphql
query {
  getHealth
}
```

#### getProfile
Get current user profile.

```graphql
query {
  getProfile {
    sub
    role
  }
}
```

#### getPatients
Get list of patients with pagination. Only authenticated users can access this query.

```graphql
query {
  getPatients(input: { page: 1, limit: 10 }) {
    items {
      id
      idCard
      status
      fullName
      diagnosis
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
    meta {
      page
      limit
      totalItems
      totalPages
      hasNextPage
      hasPrevPage
    }
  }
}
```

#### getAuditLog
Get audit log of all versions for a specific patient. Only admin role can access this query.

```graphql
query {
  getAuditLog(patientId: "patient-id") {
    id
    patientId
    version
    fullName
    birthDate
    gender
    diagnosis
    medicalNotes
    changeType
    updatedBy
    updatedAt
  }
}
```

### Mutations

#### storePatient
Create a new patient. Only doctor role can perform this action.

```graphql
mutation {
  storePatient(
    data: {
      idCard: "1234567890"
      fullName: "John Doe"
      diagnosis: "Diabetes"
      changeType: "create"
      birthDate: "1990-11-18T00:00:00.000Z"
      gender: "male"
    }
  ) {
    id
    idCard
    status
    fullName
    diagnosis
    createdAt
    createdBy
    updatedAt
    updatedBy
  }
}
```

#### updatePatient
Update patient data. Only doctor role can perform this action. Creates a new version with changeType: "update".

```graphql
mutation {
  updatePatient(
    id: "patient-id"
    data: {
      fullName: "John Updated"
      diagnosis: "Diabetes Type 2"
      birthDate: "1990-11-18T00:00:00.000Z"
      gender: "male"
      medicalNotes: "Patient needs regular checkups"
    }
  ) {
    id
    idCard
    status
    fullName
    diagnosis
    createdAt
    createdBy
    updatedAt
    updatedBy
  }
}
```

#### deletePatient
Soft delete a patient by moving to trash. Only doctor role can perform this action. Creates a new version with changeType: "delete". A cleanup job is scheduled for 2 minutes later to perform hard delete if not restored.

```graphql
mutation {
  deletePatient(id: "patient-id") {
    id
    idCard
    status
    fullName
    diagnosis
    createdAt
    createdBy
    updatedAt
    updatedBy
  }
}
```

#### restorePatient
Restore a patient from trash. Only doctor role can perform this action. Must be done within 2 minutes of deletion. Creates a new version with changeType: "restore".

```graphql
mutation {
  restorePatient(id: "patient-id") {
    id
    idCard
    status
    fullName
    diagnosis
    createdAt
    createdBy
    updatedAt
    updatedBy
  }
}
```

#### rollbackPatient
Rollback patient data to a specific version. Only doctor role can perform this action. Creates a new version with changeType: "rollback" copying data from the target version.

```graphql
mutation {
  rollbackPatient(
    data: {
      patientId: "patient-id"
      versionId: "version-id"
    }
  ) {
    id
    idCard
    status
    fullName
    diagnosis
    createdAt
    createdBy
    updatedAt
    updatedBy
  }
}
```

### Types

check this [file](./src/schema/schema.gql)

### Enums

#### EChangeType
- `create`: Initial patient creation
- `update`: Patient data update
- `delete`: Patient soft delete (moved to trash)
- `restore`: Patient restoration from trash
- `rollback`: Patient rollback to previous version

#### EGender
- `male`: Male gender
- `female`: Female gender

#### ERole
- `admin`: Administrator role
- `doctor`: Doctor role

#### EStatus
- `active`: Patient is active
- `trash`: Patient is in trash (soft deleted)

### Grace Period Feature

When a patient is deleted (soft delete), a grace period of 2 minutes is applied:
- During this period, the patient can be restored using `restorePatient` mutation
- If the patient is not restored within 2 minutes, a background job will automatically perform a hard delete
- Hard delete permanently removes the patient record and all its version history from the database
- This feature uses BullMQ for background job processing
