export interface PhaseDto {
  id?: number;
  nom: string;
  description?: string;
  ordre?: number;
  projetId: number;
  projetNom?: string;
  dateDebutPrevue?: string | Date;
  dateFinPrevue?: string | Date;
  dateDebutReelle?: string | Date;
  dateFinReelle?: string | Date;
  progression?: number;
  statut?: string;
  verrouillee?: boolean;
  etapes?: any[];
  totalEtapes?: number;
  etapesValidees?: number;
  etapesEnRetard?: number;
}
