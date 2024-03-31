# Fullstack starter app

Building a starter app using react and nestjs. We are using monorepo because they make it easy to share common dto and other code easily between backend and frontend. We are specifically using [Nx.](https://nx.dev/getting-started/intro). We are using nx 17 since I observed issue with the latest version.

## Some commands
```bash
# Create a nx monrepo
npx create-nx-workspace@17
# create a react app and select webpack as build system

# Add nestjs plugin
npx nx add @nx/nest
# Create nest app and add proxy 
npx nx g @nx/nest:app nest-app --frontendProject react-app
# Remove e2e project
npx nx g @nx/workspace:remove nest-app-e2e
# Add a common models library
npx nx g @nx/node:library common-models
# Move the common-models library to another folder
npx nx g @nx/workspace:move --project common-models --destination libs/common-models
```

Quick commands

```bash
# Run find lint and prettier error
npx nx lint react-app
npx nx lint nest-app
# Run unit tests and tests
npx nx test react-app
npx nx test nest-app
# Run app in development mode  React-app runs at 4200 port
npx nx serve react-app
# Run app in development mode  nest-app runs at 3000 port
npx nx serve nest-app
```

### Features

- Added react, nestjs app and common library for shared models
