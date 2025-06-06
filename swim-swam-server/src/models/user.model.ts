// Data model for user data

export interface User {
  user_id: number;
  public_user_id: number;
  username: string;
  email: string;
  admin: boolean;
}