import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UrlComposerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  busy: boolean;
  children: ReactNode;
  placeholder?: string;
  formId?: string;
  className?: string;
}

// The one-field pill form used by the hero, the checker and "Add a site".
export function UrlComposer({ id, label, value, onChange, onSubmit, busy, children, placeholder = "yoursite.com", formId, className }: UrlComposerProps) {
  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className={cn(
        "flex max-w-lg gap-1.5 rounded-full border border-border bg-card p-1.5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foreground",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="url"
        autoComplete="url"
        spellCheck={false}
        placeholder={placeholder}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent px-4 font-mono text-base outline-none placeholder:text-muted-foreground"
      />
      <Button type="submit" variant="flash" disabled={busy || !value.trim()}>
        {children}
      </Button>
    </form>
  );
}
