interface DividerProps {
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

export function Divider({ className = "", spacing = "md" }: DividerProps) {
  const spacingClasses = {
    sm: "my-3",
    md: "my-5",
    lg: "my-8",
  };

  return (
    <hr
      className={`border-t border-default ${spacingClasses[spacing]} ${className}`}
    />
  );
}
