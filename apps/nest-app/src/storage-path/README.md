## Storage

The goal of the storage-path modules is for storing enties in db in the form of files and directories. These can be persisted to s3 or file system. This modules is only responsible storing the tree structure in db and making queries.

Another aspect is we can built autorization based on the tree access. If you have access to parent then you will have to all the childs too.

These entities may or may not be backed by files/folders. But in our case we will have objects which will have metadata along with many files associated with the object.

- Resources like md files, videos, audio, pdf etc
- Metadata files like activity-collection, post, programming activity etc
