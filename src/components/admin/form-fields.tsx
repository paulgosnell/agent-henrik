"use client";

interface BaseProps {
  label: string;
  name: string;
  required?: boolean;
}

interface TextInputProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url" | "email" | "date";
  placeholder?: string;
}

export function TextInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: TextInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}{required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
      />
    </div>
  );
}

interface TextAreaProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export function TextArea({
  label,
  name,
  value,
  onChange,
  rows = 3,
  required,
  placeholder,
}: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}{required && " *"}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-y"
      />
    </div>
  );
}

interface NumberInputProps extends BaseProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
}

export function NumberInput({
  label,
  name,
  value,
  onChange,
  required,
  min,
  max,
}: NumberInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}{required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        required={required}
        min={min}
        max={max}
        className="px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
      />
    </div>
  );
}

interface SelectInputProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export function SelectInput({
  label,
  name,
  value,
  onChange,
  required,
  options,
}: SelectInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}{required && " *"}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CheckboxInputProps extends BaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxInput({
  label,
  name,
  checked,
  onChange,
}: CheckboxInputProps) {
  return (
    <label htmlFor={name} className="flex items-center gap-2 cursor-pointer">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[var(--foreground)]"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
