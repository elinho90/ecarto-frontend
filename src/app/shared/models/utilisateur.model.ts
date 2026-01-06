import { Role } from '../enums/role.enum';

export interface Utilisateur {
  id?: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  password?: string; // Optional, only used for creation/update
  telephone?: string;
  departement?: string;
  poste?: string;
  actif: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  refreshToken?: string;
  refreshTokenExpiry?: Date | string;
  // Propriété optionnelle pour l'avatar (côté frontend uniquement)
  avatar?: string;
}