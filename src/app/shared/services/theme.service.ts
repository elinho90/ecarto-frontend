import { Injectable, signal, effect, Renderer2, RendererFactory2 } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly STORAGE_KEY = 'ecarto-theme';
    private renderer: Renderer2;

    // Signal for reactive theme state
    currentTheme = signal<Theme>(this.getStoredTheme());

    // Observable-like getter for templates
    get isDark(): boolean {
        return this.currentTheme() === 'dark';
    }

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);

        // Apply theme on initialization
        this.applyTheme(this.currentTheme());

        // Effect to persist and apply theme changes
        effect(() => {
            const theme = this.currentTheme();
            this.applyTheme(theme);
            localStorage.setItem(this.STORAGE_KEY, theme);
        });
    }

    toggleTheme(): void {
        const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
        this.currentTheme.set(newTheme);
    }

    setTheme(theme: Theme): void {
        this.currentTheme.set(theme);
    }

    private getStoredTheme(): Theme {
        if (typeof window === 'undefined') return 'light';
        const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
        // Check system preference
        if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    private applyTheme(theme: Theme): void {
        if (typeof document === 'undefined') return;
        document.documentElement.setAttribute('data-theme', theme);
    }
}
