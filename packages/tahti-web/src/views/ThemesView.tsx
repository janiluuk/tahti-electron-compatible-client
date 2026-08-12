import { Button } from '@nuclearplayer/ui';

import { useThemeStore } from '../stores/themeStore';

export function ThemesView() {
  const { themes, themeId, dark, setTheme, setDark } = useThemeStore();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Themes
        </h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          Nuclear basic themes via CSS variables (<code>data-theme-id</code> +
          dark mode).
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Mode</span>
        <Button
          size="sm"
          variant={dark ? undefined : 'text'}
          onClick={() => setDark(true)}
        >
          Dark
        </Button>
        <Button
          size="sm"
          variant={!dark ? undefined : 'text'}
          onClick={() => setDark(false)}
        >
          Light
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {themes.map((theme) => {
          const active = theme.id === themeId;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className={
                active
                  ? 'border-border bg-primary rounded-lg border p-4 text-left'
                  : 'border-border bg-background hover:bg-background-secondary rounded-lg border p-4 text-left'
              }
            >
              <div className="mb-3 flex gap-2">
                {theme.palette.map((color) => (
                  <span
                    key={color}
                    className="border-border size-8 rounded-md border"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <div className="font-bold">{theme.name}</div>
              <div className="text-foreground-secondary text-xs">
                {theme.id}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
