# Tailwind CSS v4 & Theme Tokens

---

## 1. Theme Configuration in Tailwind CSS v4

Tokens are declared in `packages/worktrees-studio-ds/src/styles/global.css` using `@layer theme` and `@theme static`:

```css
@layer theme {
  :root {
    @variant light {
      --accent: #079789;
      --accent-foreground: var(--snow);
      --focus: var(--accent);
    }

    @variant dark {
      --accent: #079789;
      --accent-foreground: var(--snow);
      --focus: var(--accent);
    }
  }
}

@theme static {
  --color-primary: var(--accent);
  --color-primary-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-success: var(--success);
  --color-danger: var(--danger);
  --radius-lg: calc(var(--radius) * 1);
}
```
