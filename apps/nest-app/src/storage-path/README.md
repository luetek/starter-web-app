## Storage

The goal of the storage modules is for persiting file data either in file system, aws s3 storage or github.

The file system can be readonly too. In which case we will just scan it and run our system.

There will be two types of files which are of our concern.

- Resources like md files, videos, audio, pdf etc
- Metadata files like activity-collection, post, programming activity etc

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
- Added a publication service for notifying event to other services.
