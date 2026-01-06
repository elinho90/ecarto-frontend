import { Utilisateur } from './utilisateur.model';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number | null;
  issuedAt: string | null;
  expiresAt: string | null;
  user: Utilisateur;
}