export type Theme = 'light' | 'dark' | 'auto';

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme;

  root.classList.remove('light', 'dark');
  root.classList.add(resolved);

  if (theme === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }

  root.style.colorScheme = resolved;
  localStorage.setItem('theme', theme);
}
