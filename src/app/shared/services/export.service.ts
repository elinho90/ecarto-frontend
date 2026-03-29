import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
    header: string;
    key: string;
    width?: number;
    transform?: (value: any) => any;
}

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    /**
     * Export data to Excel file
     * @param data Array of objects to export
     * @param filename Name of the file (without extension)
     * @param columns Column configuration for mapping and headers
     * @param sheetName Name of the worksheet
     */
    exportToExcel<T>(
        data: T[],
        filename: string,
        columns: ExportColumn[],
        sheetName: string = 'Données'
    ): void {
        // Transform data according to column configuration
        const transformedData = data.map(item => {
            const row: Record<string, any> = {};
            columns.forEach(col => {
                let value = this.getNestedValue(item, col.key);
                if (col.transform) {
                    value = col.transform(value);
                }
                row[col.header] = value;
            });
            return row;
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(transformedData);

        // Set column widths
        const colWidths = columns.map(col => ({ wch: col.width || 15 }));
        worksheet['!cols'] = colWidths;

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Save file
        const timestamp = new Date().toISOString().slice(0, 10);
        saveAs(blob, `${filename}_${timestamp}.xlsx`);
    }

    /**
     * Export projects to Excel with predefined columns
     */
    exportProjets(projets: any[]): void {
        const columns: ExportColumn[] = [
            { header: 'ID', key: 'id', width: 8 },
            { header: 'Nom du Projet', key: 'nom', width: 30 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Responsable', key: 'responsable', width: 20 },
            { header: 'Type', key: 'typeProjetNom', width: 20 },
            { header: 'Site', key: 'siteNom', width: 20 },
            { header: 'Statut', key: 'statut', width: 12, transform: this.formatStatut },
            { header: 'Priorité', key: 'priorite', width: 12, transform: this.formatPriorite },
            { header: 'Progression (%)', key: 'progression', width: 15 },
            { header: 'Budget (FCFA)', key: 'budget', width: 18, transform: (v) => v?.toLocaleString() || '0' },
            { header: 'Date Début', key: 'dateDebut', width: 12, transform: this.formatDate },
            { header: 'Date Fin Prévue', key: 'dateFinPrevue', width: 15, transform: this.formatDate }
        ];

        this.exportToExcel(projets, 'Projets_ECarto', columns, 'Projets');
    }

    /**
     * Export sites to Excel with predefined columns
     */
    exportSites(sites: any[]): void {
        const columns: ExportColumn[] = [
            { header: 'ID', key: 'id', width: 8 },
            { header: 'Nom du Site', key: 'nom', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Statut', key: 'statut', width: 12 },
            { header: 'Adresse', key: 'adresse', width: 35 },
            { header: 'Région', key: 'region', width: 20 },
            { header: 'Ville', key: 'ville', width: 20 },
            { header: 'Latitude', key: 'latitude', width: 12 },
            { header: 'Longitude', key: 'longitude', width: 12 },
            { header: 'Responsable', key: 'responsable', width: 20 },
            { header: 'Téléphone', key: 'telephone', width: 15 },
            { header: 'Email', key: 'email', width: 25 }
        ];

        this.exportToExcel(sites, 'Sites_ECarto', columns, 'Sites');
    }

    /**
     * Export rapports to Excel with predefined columns
     */
    exportRapports(rapports: any[]): void {
        const columns: ExportColumn[] = [
            { header: 'ID', key: 'id', width: 8 },
            { header: 'Titre', key: 'titre', width: 35 },
            { header: 'Description', key: 'description', width: 45 },
            { header: 'Projet', key: 'projetNom', width: 25 },
            { header: 'Type', key: 'typeRapport', width: 15 },
            { header: 'Auteur', key: 'auteur', width: 20 },
            { header: 'Date de Création', key: 'createdAt', width: 15, transform: this.formatDate }
        ];

        this.exportToExcel(rapports, 'Rapports_ECarto', columns, 'Rapports');
    }

    // Helper methods
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    private formatDate(value: string | Date): string {
        if (!value) return '';
        const date = new Date(value);
        return date.toLocaleDateString('fr-FR');
    }

    private formatStatut(statut: string): string {
        const map: Record<string, string> = {
            'EN_COURS': 'En cours',
            'TERMINE': 'Terminé',
            'PREVU': 'Prévu',
            'ANNULE': 'Annulé'
        };
        return map[statut] || statut;
    }

    private formatPriorite(priorite: string): string {
        const map: Record<string, string> = {
            'CRITIQUE': 'Critique',
            'HAUTE': 'Haute',
            'MOYENNE': 'Moyenne',
            'FAIBLE': 'Faible'
        };
        return map[priorite] || priorite;
    }
}
