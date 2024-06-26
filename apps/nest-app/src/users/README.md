## User Creation

User module provides the functionality for creating/accessing user information. We need to create user using CreateUserForm where we ask for username, full name, password etc. We can also create a user using facebook, google login. In this case we will collect the above information using thier respective apis.

This mpdule is not responsible for anything else specifically how the user will authenticate etc. We also need to make sure the user account creation is behind a captha so that automated api cannot create users.

Create account using google https://blog.logrocket.com/guide-adding-google-login-react-app/

```bash
npm install @automapper/nestjs @automapper/classes @nestjs/typeorm @nestjs/config @nestlab/google-recaptcha class-validator class-transformer bcrypt sqlite3 typeorm @automapper/core

npm install supertest  --save-dev
```

### Feature list

- [Request Dto Validation](https://docs.nestjs.com/techniques/validation) functionality is added. This enables http api throwing 400 `Bad Request` error if the dto contains validation errors.

- [Dto AutoMapper](https://automapperts.netlify.app/docs/nestjs) We want to map Entity to Dto when we are sending an api response. We will have fields in entity which are internal and we dont want to leak them to user. Auto mapper patterns make that task easy.
- Added User module with create user controller. See [user.http](./user.http) for api example which can be run using http client vscode extension
- Added acceptance test for api [tests](./user.controller.spec.ts). I will not be writing both Unit Test and Acceptance Tests. Will be adding unit tests when a cetain scenario cannot be tested using E2E tests. This provide a good enough tradeoff.
- Added nest-changes for Google captha. We have disabled it for now in test and development.
- Added google auth changes to fetch data from google to create a User Account. In this scenario not username/ password is created for user.

## Authentication

```bash
npm install @nestjs/jwt  @nestjs/passport passport-jwt passport-local @nestjs/cache-manager cache-manager
npm i -S cache-manager

```

- Added api for user/password login
- Added api for google login
- Added profile page with update functionality
- Account lock after 5 password failures.
- logout functionality
- Api authentication using jwt token
- Jwt token is stored in DB allowing us to invalidate it by deleting form db.
- jwt token are cached to improve performance and latency of api calls
