export interface User {
  _id: string;
  email: string;
  name: string;
  isAdmin: "master" | "normal" | null;
  avatarUrl: string | null;
  birthdate: string | null;
  gender: "male" | "female" | "other" | null;
  createdAt: string;
}
