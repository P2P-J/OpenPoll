/**
 * Design System Showcase
 * Demonstrates all design system components and utilities
 * This page is for development/documentation purposes
 */

import { Button } from '@/components/atoms/button/Button';
import { ProgressBar } from '@/components/atoms/progressBar/ProgressBar';
import { ThemeToggle } from '@/components/atoms/themeToggle/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Star, Heart, Zap, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

export function DesignShowcase() {
  const { theme, isDark } = useTheme();

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="heading-1 mb-4 animate-fade-in">
            OpenPoll Design System
          </h1>
          <p className="body-large animate-fade-in animate-delay-100" style={{ color: 'var(--color-foreground-muted)' }}>
            Production-grade components and utilities
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 animate-fade-in animate-delay-200">
            <div className="badge">Current: {theme}</div>
            <div className="badge">{isDark ? 'Dark Mode' : 'Light Mode'}</div>
            <ThemeToggle />
          </div>
        </div>

        {/* Color System */}
        <Section title="Color System" id="colors">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard label="Primary" variable="--color-primary" />
            <ColorCard label="Secondary" variable="--color-secondary" />
            <ColorCard label="Success" variable="--color-success" />
            <ColorCard label="Warning" variable="--color-warning" />
            <ColorCard label="Error" variable="--color-error" />
            <ColorCard label="Info" variable="--color-info" />
            <ColorCard label="Surface" variable="--color-surface" />
            <ColorCard label="Foreground" variable="--color-foreground" />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography" id="typography">
          <div className="space-y-6">
            <div>
              <h1 className="heading-1">Heading 1 - Large Display</h1>
              <h2 className="heading-2 mt-4">Heading 2 - Section Title</h2>
              <h3 className="heading-3 mt-4">Heading 3 - Subsection</h3>
              <h4 className="heading-4 mt-4">Heading 4 - Component Title</h4>
            </div>
            <div className="divider-gradient" />
            <div>
              <p className="body-large mb-2">Body Large - Lead paragraph text</p>
              <p className="body mb-2">Body - Regular paragraph text for content</p>
              <p className="body-small mb-2">Body Small - Secondary information</p>
              <p className="caption">Caption - Small helper text</p>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons" id="buttons">
          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h4 className="heading-4 mb-4">Variants</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="heading-4 mb-4">Sizes</h4>
              <div className="flex items-center flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h4 className="heading-4 mb-4">States</h4>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button isLoading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h4 className="heading-4 mb-4">With Icons</h4>
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Star className="w-4 h-4" />
                  Star
                </Button>
                <Button variant="secondary">
                  <Heart className="w-4 h-4" />
                  Like
                </Button>
                <Button variant="success">
                  <Zap className="w-4 h-4" />
                  Boost
                </Button>
              </div>
            </div>

            {/* Full Width */}
            <div>
              <h4 className="heading-4 mb-4">Full Width</h4>
              <Button fullWidth>Full Width Button</Button>
            </div>
          </div>
        </Section>

        {/* Progress Bars */}
        <Section title="Progress Bars" id="progress">
          <div className="space-y-6">
            <div>
              <h4 className="heading-4 mb-4">Variants</h4>
              <div className="space-y-4">
                <ProgressBar value={75} variant="default" showLabel labelPosition="outside" />
                <ProgressBar value={85} variant="success" showLabel labelPosition="outside" />
                <ProgressBar value={60} variant="warning" showLabel labelPosition="outside" />
                <ProgressBar value={40} variant="error" showLabel labelPosition="outside" />
                <ProgressBar value={90} variant="info" showLabel labelPosition="outside" />
              </div>
            </div>

            <div>
              <h4 className="heading-4 mb-4">Sizes</h4>
              <div className="space-y-4">
                <ProgressBar value={75} height="sm" />
                <ProgressBar value={75} height="md" />
                <ProgressBar value={75} height="lg" showLabel labelPosition="inside" />
              </div>
            </div>

            <div>
              <h4 className="heading-4 mb-4">With Glow Effect</h4>
              <ProgressBar value={80} variant="success" showGlow showLabel />
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges" id="badges">
          <div className="flex flex-wrap gap-3">
            <span className="badge">Default</span>
            <span className="badge-success">
              <CheckCircle className="w-3 h-3" />
              Success
            </span>
            <span className="badge-warning">
              <AlertCircle className="w-3 h-3" />
              Warning
            </span>
            <span className="badge-error">
              <XCircle className="w-3 h-3" />
              Error
            </span>
            <span className="badge-info">
              <Info className="w-3 h-3" />
              Info
            </span>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards" id="cards">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <h4 className="heading-4 mb-2">Basic Card</h4>
              <p className="body-small" style={{ color: 'var(--color-foreground-muted)' }}>
                A simple card with hover effect
              </p>
            </div>
            <div className="card card-interactive">
              <h4 className="heading-4 mb-2">Interactive Card</h4>
              <p className="body-small" style={{ color: 'var(--color-foreground-muted)' }}>
                Lifts on hover, clickable
              </p>
            </div>
            <div className="card glass-effect">
              <h4 className="heading-4 mb-2">Glass Effect</h4>
              <p className="body-small" style={{ color: 'var(--color-foreground-muted)' }}>
                Card with frosted glass effect
              </p>
            </div>
          </div>
        </Section>

        {/* Animations */}
        <Section title="Animations" id="animations">
          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            <AnimationDemo
              title="Fade In"
              animation="animate-fade-in"
            />
            <AnimationDemo
              title="Slide In Up"
              animation="animate-slide-in-up"
            />
            <AnimationDemo
              title="Scale In"
              animation="animate-scale-in"
            />
            <AnimationDemo
              title="Bounce In"
              animation="animate-bounce-in"
            />
            <AnimationDemo
              title="Float"
              animation="animate-float"
            />
            <AnimationDemo
              title="Pulse"
              animation="animate-pulse"
            />
          </div>

          <div className="mt-8">
            <h4 className="heading-4 mb-4">Hover Effects</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card hover-lift">
                <p className="body">Hover Lift</p>
              </div>
              <div className="card hover-scale">
                <p className="body">Hover Scale</p>
              </div>
              <div className="card hover-glow">
                <p className="body">Hover Glow</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Shadows */}
        <Section title="Shadows & Elevation" id="shadows">
          <div className="grid md:grid-cols-3 gap-6">
            <ShadowDemo label="Small" shadow="shadow-sm" />
            <ShadowDemo label="Medium" shadow="shadow-md" />
            <ShadowDemo label="Large" shadow="shadow-lg" />
            <ShadowDemo label="Extra Large" shadow="shadow-xl" />
            <ShadowDemo label="2XL" shadow="shadow-2xl" />
            <ShadowDemo label="Smooth" shadow="shadow-smooth" />
          </div>
        </Section>

        {/* Spacing */}
        <Section title="Spacing System" id="spacing">
          <div className="space-y-4">
            {[1, 2, 4, 6, 8, 12, 16].map((space) => (
              <div key={space} className="flex items-center gap-4">
                <div className="w-20 caption">space-{space}</div>
                <div
                  style={{
                    width: `var(--space-${space})`,
                    height: 'var(--space-4)',
                    backgroundColor: 'var(--color-primary)',
                  }}
                />
                <div className="body-small" style={{ color: 'var(--color-foreground-muted)' }}>
                  {space * 0.25}rem
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Utilities */}
        <Section title="Utility Classes" id="utilities">
          <div className="space-y-6">
            <div>
              <h4 className="heading-4 mb-4">Text Utilities</h4>
              <p className="text-gradient heading-3 mb-2">Gradient Text</p>
              <p className="truncate body max-w-xs">
                This is a very long text that will be truncated with ellipsis when it exceeds the container width
              </p>
            </div>

            <div>
              <h4 className="heading-4 mb-4">Loading States</h4>
              <div className="flex items-center gap-6">
                <div className="loading-spinner w-8 h-8" />
                <div className="loading-dots flex gap-2">
                  <span /><span /><span />
                </div>
                <div className="skeleton h-8 w-32" />
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* Helper Components */

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <h2 className="heading-2 mb-8 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColorCard({ label, variable }: { label: string; variable: string }) {
  return (
    <div className="card">
      <div
        className="h-20 rounded-lg mb-3"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <p className="font-medium body-small">{label}</p>
      <p className="caption">{variable}</p>
    </div>
  );
}

function AnimationDemo({ title, animation }: { title: string; animation: string }) {
  return (
    <div className={`card text-center ${animation}`}>
      <Zap className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
      <p className="font-medium body">{title}</p>
    </div>
  );
}

function ShadowDemo({ label, shadow }: { label: string; shadow: string }) {
  return (
    <div className={`card ${shadow}`} style={{ backgroundColor: 'var(--color-surface)' }}>
      <p className="font-medium body text-center">{label}</p>
    </div>
  );
}
