export interface User {
  id: number;
  firstName: string;
  lastName: string;
  primaryEmail: string;
}

export interface UserAccessToken {
  id: number;
  token: string;
  createdAt: Date;
  user: User;
}
