export enum Role {
  ADMINISTRATEUR_SYSTEME = 'ADMINISTRATEUR_SYSTEME',
  CHEF_DE_PROJET = 'CHEF_DE_PROJET',
  ANALYSTE = 'ANALYSTE',
  DEVELOPPEUR = 'DEVELOPPEUR',
  DECIDEUR = 'DECIDEUR',
  OBSERVATEUR = 'OBSERVATEUR',
 
}

// Helper pour obtenir les labels en français
export const RoleLabels: Record<Role, string> = {
  [Role.ADMINISTRATEUR_SYSTEME]: 'Administrateur Système',
  [Role.CHEF_DE_PROJET]: 'Chef de Projet',
  [Role.ANALYSTE]: 'Analyste',
  [Role.DEVELOPPEUR]: 'Développeur',
  [Role.DECIDEUR]: 'Décideur',
  [Role.OBSERVATEUR]: 'Observateur'
};

// Helper pour obtenir les variantes de badge
export const RoleVariants: Record<Role, 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'error'> = {
  [Role.ADMINISTRATEUR_SYSTEME]: 'primary',
  [Role.CHEF_DE_PROJET]: 'success',
  [Role.ANALYSTE]: 'info',
  [Role.DEVELOPPEUR]: 'warning',
  [Role.DECIDEUR]: 'primary',
  [Role.OBSERVATEUR]: 'neutral'
};