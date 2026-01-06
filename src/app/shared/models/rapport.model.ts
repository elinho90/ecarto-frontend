import { Projet } from './projet.model';
import { Utilisateur } from './utilisateur.model';

export interface Rapport {
  id: number;
  nom: string;
  description?: string;
  fichierNom: string;
  fichierType: string;
  fichierTaille: number;
  fichierChemin: string;
  projetId?: number;
  projet?: Projet;
  uploadePar: string;
  faisabilite: number;
  risque: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  budgetEstime?: number;
  dureeEstimeeMois: number;
  recommandations?: string;
  analyseAutomatique: boolean;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}