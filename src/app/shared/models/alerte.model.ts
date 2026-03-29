export interface AlerteDto {
  id?: number;
  projetId?: number;
  projetNom?: string;
  etapeId?: number;
  etapeNom?: string;
  type?: string;
  niveau: string;
  message: string;
  lue: boolean;
  resolue: boolean;
  destinataireId?: number;
  createdAt: string | Date;
}
