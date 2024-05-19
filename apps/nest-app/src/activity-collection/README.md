## Activity Collection

Stores the metadata for storing a group of related resources like post, vidoes, programming-activity etc.

Listens to storage events for changes in metadata. Once changes are there parses the json files, validate it and store the data in DB or in-memory.

- In-memory - We need to reload all the data on startup.
- db - no need to reload on startup. Also less memory required.

Features

- Api calls. See [collection.http](./collection.http) for api example
- Added a publication service for notifying event to other services.
