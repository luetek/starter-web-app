import { StoragePath } from '../storage-path/common.interface';

export enum ActivityType {
  READING_ACTIVITY = 'READING_ACTIVITY',
  PROGRAMMING_ACTIVITY_STDIO_CHECK = 'PROGRAMMING_ACTIVITY_STDIO_CHECK',
}

export interface ActivitySpec {
  type: ActivityType;
}

export interface Activity {
  id: number;

  title: string;

  description: string;

  collectionId: number;

  parent: StoragePath; // Parent folder

  keywords: string[];

  activitySpec: ActivitySpec;
}

export interface ActivityCollection {
  id: number;

  title: string;

  description: string;

  activities: Activity[];

  authors: string[];

  keywords: string[];
}
