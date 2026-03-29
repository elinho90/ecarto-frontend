export interface TypeProjet {
  id: number;
  nom: string;
  description?: string;
  libelle?: string;
  couleur?: string;
  icone?: string;
  estActif?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}