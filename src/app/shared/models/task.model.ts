export interface Task {
    id?: number;
    title: string;
    description?: string;
    statut: TaskStatus;
    displayOrder: number;
    projetId: number;
    projetNom?: string;
    createdAt?: string;
    updatedAt?: string;
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
}

export interface TaskReorder {
    newStatut: TaskStatus;
    newOrder: number;
}

export interface TasksGrouped {
    TODO: Task[];
    IN_PROGRESS: Task[];
    DONE: Task[];
}
