export interface EtapeDto {
  id?: number;
  nom: string;
  description?: string;
  ordre?: number;
  phaseId: number;
  phaseNom?: string;
  responsableId?: number;
  responsableNom?: string;
  dateEcheance: string | Date;
  dateRealisation?: string | Date;
  dureeEstimeeJours?: number;
  dureeReelleJours?: number;
  statut?: string;
  validationRequise?: boolean;
  bloquante?: boolean;
  typeLivrable?: string;
  urlLivrable?: string;
  enRetard?: boolean;
  joursRetard?: number;
  joursRestants?: number;
}
