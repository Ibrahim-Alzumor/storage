export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  jobTitle?: string;
  phone?: string;
  clearanceLevel: number;
  active?: boolean;
}
