import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    isDarkMode = signal<boolean>(false);

    private mediaQueryListener: (e: MediaQueryListEvent) => void;

    constructor() {
        this.initializeTheme();

        // Output side effect whenever the signal changes
        effect(() => {
            const isDark = this.isDarkMode();
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });

        // Listen for OS theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQueryListener = (e: MediaQueryListEvent) => {
            // Only auto-switch if the user hasn't explicitly overridden the theme this session
            // or if we decide to always follow the OS when it changes
            if (!localStorage.getItem('theme_overridden')) {
                this.isDarkMode.set(e.matches);
            }
        };
        mediaQuery.addEventListener('change', this.mediaQueryListener);
    }

    private initializeTheme() {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            this.isDarkMode.set(savedTheme === 'dark');
        } else {
            // Check system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.isDarkMode.set(prefersDark);
        }
    }

    toggleTheme() {
        this.isDarkMode.update(dark => !dark);
        localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
        localStorage.setItem('theme_overridden', 'true');
    }

    setTheme(isDark: boolean) {
        this.isDarkMode.set(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme_overridden', 'true');
    }

    resetToSystem() {
        localStorage.removeItem('theme');
        localStorage.removeItem('theme_overridden');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkMode.set(prefersDark);
    }
}
