## Storage

The goal of the storage modules is for persiting file data either in file system or aws s3 storage.

Optional Env needed for S3

```bash
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
```

Features

- Mark a root folder for access via the app
- Mark a s3 bucket for access via the app
- scan the root folder for syncing. See [folders.http](./folders.http) for api example which can be run using http client vscode extension.
