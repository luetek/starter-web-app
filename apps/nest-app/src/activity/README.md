### Activity

This modules is responsible for creating an activity. The activity is associated with a folder which stores all the related files associated with that activity. Activities are grouped together in the activityCollection.

Once the record is saved the corresponding subscriber will save the data in `activity.json` for backup purposes. This ensures file system contains the total backup of data and can be used to restore the system incase of data loss in db.
