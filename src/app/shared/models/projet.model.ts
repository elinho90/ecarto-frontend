import { StatutProjet } from '../enums/statut-projet.enum';
import { PrioriteProjet } from '../enums/priorite-projet.enum';

export interface Projet {
  id?: number;
  nom: string;
  description?: string;
  statut: StatutProjet;
  priorite: PrioriteProjet;
  responsable: string;
  dateDebut: Date;
  dateFinPrevue?: Date;
  dateFinReelle?: Date;
  budget?: number;
  progression?: number;
  typeProjetId?: number;
  typeProjetNom?: string;
  siteId?: number;
  siteNom?: string;
  equipe?: string[];
  tags?: string;
  // Champs calculés
  dureeJours?: number;
  coutParJour?: number;
}