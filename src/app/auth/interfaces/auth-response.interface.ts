import { User } from './user.interface';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  fullName: string;
}
