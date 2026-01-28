# OpenPoll Design System

A production-grade design system with comprehensive color management, typography, spacing, animations, and dark mode support.

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing](#spacing)
- [Shadows & Elevation](#shadows--elevation)
- [Animations](#animations)
- [Dark Mode](#dark-mode)
- [Components](#components)
- [Best Practices](#best-practices)

## 🎨 Overview

The OpenPoll Design System is built with:
- **CSS Custom Properties** for dynamic theming
- **OKLCH Color Space** for perceptually uniform colors
- **Fluid Typography** with clamp() for responsive text
- **Production-ready animations** with reduced motion support
- **Automatic dark mode** with system preference detection

## 🚀 Getting Started

The design system is automatically imported in `src/index.css`. All design tokens are available as CSS custom properties.

```tsx
// Use design tokens via CSS variables
<div style={{
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-foreground)',
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
}}>
  Content
</div>
```

## 🎨 Color System

### Semantic Colors

Colors adapt automatically between light and dark modes:

```css
/* Background layers */
--color-background      /* Base background */
--color-surface         /* Card/component surface */
--color-surface-elevated /* Elevated surfaces */
--color-surface-overlay  /* Modal/overlay backgrounds */

/* Foreground colors */
--color-foreground       /* Primary text */
--color-foreground-muted /* Secondary text */
--color-foreground-subtle /* Disabled/subtle text */

/* Border colors */
--color-border          /* Default borders */
--color-border-hover    /* Hovered borders */
--color-border-focus    /* Focused borders */
```

### Interactive States

```css
/* Primary actions */
--color-primary
--color-primary-hover
--color-primary-active
--color-primary-foreground

/* Secondary actions */
--color-secondary
--color-secondary-hover
--color-secondary-active
--color-secondary-foreground
```

### Status Colors

```css
/* Success states */
--color-success
--color-success-hover
--color-success-bg
--color-success-border

/* Error states */
--color-error
--color-error-hover
--color-error-bg
--color-error-border

/* Warning states */
--color-warning
--color-warning-hover
--color-warning-bg
--color-warning-border

/* Info states */
--color-info
--color-info-hover
--color-info-bg
--color-info-border
```

### Usage Example

```tsx
// Using utility classes
<div className="badge-success">Success</div>
<div className="badge-error">Error</div>

// Using inline styles
<div style={{ backgroundColor: 'var(--color-success-bg)' }}>
  Custom component
</div>
```

## ✍️ Typography

### Font Sizes (Fluid Scale)

Automatically scales between mobile and desktop:

```css
--font-size-xs    /* 0.75rem → 0.813rem */
--font-size-sm    /* 0.875rem → 0.938rem */
--font-size-base  /* 1rem → 1.063rem */
--font-size-lg    /* 1.125rem → 1.25rem */
--font-size-xl    /* 1.25rem → 1.5rem */
--font-size-2xl   /* 1.5rem → 1.875rem */
--font-size-3xl   /* 1.875rem → 2.5rem */
--font-size-4xl   /* 2.25rem → 3.25rem */
--font-size-5xl   /* 3rem → 4.5rem */
```

### Utility Classes

```tsx
<h1 className="heading-1">Large Heading</h1>
<h2 className="heading-2">Medium Heading</h2>
<p className="body-large">Large body text</p>
<p className="body">Regular body text</p>
<span className="caption">Small caption</span>
```

### Font Weights

```css
--font-weight-light: 300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-black: 900
```

## 📏 Spacing

Consistent spacing scale from 0 to 64:

```css
--space-1  /* 0.25rem / 4px */
--space-2  /* 0.5rem / 8px */
--space-4  /* 1rem / 16px */
--space-6  /* 1.5rem / 24px */
--space-8  /* 2rem / 32px */
--space-12 /* 3rem / 48px */
--space-16 /* 4rem / 64px */
/* ... and more */
```

### Usage

```tsx
<div style={{
  padding: 'var(--space-4)',
  marginBottom: 'var(--space-8)',
  gap: 'var(--space-6)',
}}>
  Spaced content
</div>
```

## 🌑 Shadows & Elevation

### Shadow Scale

```css
--shadow-xs   /* Subtle shadow */
--shadow-sm   /* Small shadow */
--shadow-md   /* Medium shadow */
--shadow-lg   /* Large shadow */
--shadow-xl   /* Extra large shadow */
--shadow-2xl  /* Maximum shadow */
```

### Colored Shadows

```css
--shadow-primary  /* Primary color shadow */
--shadow-success  /* Success color shadow */
--shadow-error    /* Error color shadow */
```

### Usage

```tsx
<div className="card hover-lift shadow-smooth">
  Card with shadow
</div>
```

## ✨ Animations

### Built-in Animations

```tsx
// Fade animations
<div className="animate-fade-in">Fades in</div>
<div className="animate-fade-out">Fades out</div>

// Slide animations
<div className="animate-slide-in-up">Slides up</div>
<div className="animate-slide-in-down">Slides down</div>

// Scale animations
<div className="animate-scale-in">Scales in</div>
<div className="animate-bounce-in">Bounces in</div>

// Continuous animations
<div className="animate-pulse">Pulses</div>
<div className="animate-spin">Spins</div>
<div className="animate-float">Floats</div>
```

### Animation Delays

```tsx
<div className="animate-fade-in animate-delay-100">
  Delayed by 100ms
</div>
```

### Stagger Children

```tsx
<div className="stagger-children">
  <div className="animate-slide-in-up">Item 1</div>
  <div className="animate-slide-in-up">Item 2</div>
  <div className="animate-slide-in-up">Item 3</div>
  {/* Each child animates with increasing delay */}
</div>
```

### Hover Effects

```tsx
<button className="hover-lift">Lifts on hover</button>
<button className="hover-scale">Scales on hover</button>
<button className="hover-glow">Glows on hover</button>
<button className="hover-shine">Shine effect</button>
```

### Loading States

```tsx
// Skeleton loading
<div className="skeleton h-20 w-full" />

// Loading spinner
<div className="loading-spinner w-8 h-8" />

// Loading dots
<div className="loading-dots">
  <span /><span /><span />
</div>
```

## 🌓 Dark Mode

### Using the Theme Hook

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Is dark: {isDark ? 'Yes' : 'No'}</p>

      <button onClick={toggleTheme}>
        Toggle Theme
      </button>

      <button onClick={() => setTheme('light')}>
        Light Mode
      </button>

      <button onClick={() => setTheme('dark')}>
        Dark Mode
      </button>

      <button onClick={() => setTheme('system')}>
        System Preference
      </button>
    </div>
  );
}
```

### Theme Toggle Component

```tsx
import { ThemeToggle } from '@/components/atoms/themeToggle/ThemeToggle';

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

## 🧩 Components

### Enhanced Button

```tsx
import { Button } from '@/components/atoms/button/Button';

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>

// Full width
<Button fullWidth>Full Width</Button>

// Rounded
<Button rounded="full">Fully Rounded</Button>
```

## 🎯 Best Practices

### 1. Always Use Design Tokens

```tsx
// ❌ Don't hardcode values
<div style={{ padding: '16px', color: '#000' }}>

// ✅ Do use design tokens
<div style={{
  padding: 'var(--space-4)',
  color: 'var(--color-foreground)'
}}>
```

### 2. Use Utility Classes

```tsx
// ❌ Don't create custom styles unnecessarily
<div className="my-custom-card">

// ✅ Do use utility classes
<div className="card hover-lift shadow-smooth">
```

### 3. Semantic HTML

```tsx
// ❌ Don't use generic divs for everything
<div onClick={handleClick}>Click me</div>

// ✅ Do use semantic elements
<button onClick={handleClick}>Click me</button>
```

### 4. Accessibility

```tsx
// ✅ Always include proper ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <CloseIcon />
</button>

// ✅ Use sr-only class for screen reader text
<span className="sr-only">Loading content</span>
```

### 5. Responsive Design

```tsx
// ✅ Use responsive utility classes
<div className="hide-on-mobile show-on-tablet">
  Desktop content
</div>

// ✅ Use fluid spacing
<section className="section-spacing">
  Content with responsive padding
</section>
```

### 6. Performance

```tsx
// ✅ Use will-change for animated elements
<div className="animate-float will-change-transform">
  Animated content
</div>

// ✅ Remove will-change after animation
<div className="will-change-auto">
  Static content after animation
</div>
```

### 7. Dark Mode

```tsx
// ✅ Design with both modes in mind
function Card() {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-foreground)',
      borderColor: 'var(--color-border)',
    }}>
      Content that works in both modes
    </div>
  );
}
```

## 📦 File Structure

```
src/
├── styles/
│   ├── design-tokens.css    # Color, spacing, typography tokens
│   ├── animations.css        # Animation keyframes & utilities
│   └── utilities.css         # Utility classes
├── hooks/
│   └── useDarkMode.ts       # Dark mode hook
├── contexts/
│   └── ThemeContext.tsx     # Theme provider
└── components/
    └── atoms/
        └── themeToggle/
            └── ThemeToggle.tsx  # Theme toggle button
```

## 🔧 Customization

### Modifying Design Tokens

Edit `src/styles/design-tokens.css` to customize:

```css
:root {
  /* Change primary color */
  --color-primary: oklch(0.55 0.20 250);

  /* Adjust spacing scale */
  --space-4: 1.5rem;

  /* Customize animations */
  --duration-normal: 300ms;
}
```

### Adding Custom Animations

Add to `src/styles/animations.css`:

```css
@keyframes my-custom-animation {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-my-custom {
  animation: my-custom-animation 2s ease infinite;
}
```

## 🎓 Learning Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [OKLCH Color Space](https://oklch.com/)
- [Fluid Typography](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
- [Animation Best Practices](https://web.dev/animations/)

## 🐛 Troubleshooting

### Dark mode not working

Make sure `ThemeProvider` wraps your app:

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

<ThemeProvider>
  <App />
</ThemeProvider>
```

### Animations not showing

Check if reduced motion is enabled:

```tsx
// Animations respect prefers-reduced-motion automatically
// Users with reduced motion will see instant transitions
```

### Colors not updating

Ensure you're using CSS variables, not hardcoded colors:

```tsx
// ❌ Won't update with theme
<div style={{ color: '#000' }}>

// ✅ Will update with theme
<div style={{ color: 'var(--color-foreground)' }}>
```

---

Built with ❤️ for OpenPoll
