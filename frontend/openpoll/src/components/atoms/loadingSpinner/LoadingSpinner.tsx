export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'var(--color-border)' }}></div>
          <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-foreground)', borderTopColor: 'transparent' }}></div>
        </div>
        <p className="text-foreground-muted font-medium">로딩 중...</p>
      </div>
    </div>
  );
}
