"use client";

import { useId } from "react";
import { AlertCircle, Loader2, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** Clase base de todos los controles (input, select, textarea). */
export const estiloInput =
  "w-full rounded-xl border border-arena bg-white px-3.5 text-sm text-carbon shadow-[var(--shadow-suave)] outline-none transition placeholder:text-niebla/60 hover:border-verde-golf/40 focus:border-verde-golf focus:ring-4 focus:ring-verde-golf/10 disabled:cursor-not-allowed disabled:bg-crema disabled:opacity-60";

export const alturaInput = "h-11";

/** Tarjeta con encabezado (ícono + título + descripción) que agrupa campos. */
export function Seccion({
  icono,
  titulo,
  descripcion,
  children,
  className,
}: {
  icono?: React.ReactNode;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)] sm:p-6",
        className,
      )}
    >
      <header className="mb-5 flex items-start gap-3">
        {icono && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-verde-golf/10 text-verde-golf">
            {icono}
          </span>
        )}
        <div>
          <h2 className="font-serif text-lg leading-tight text-carbon">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-sm text-niebla">{descripcion}</p>}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Etiqueta + control + ayuda opcional. */
export function Campo({
  label,
  ayuda,
  children,
  className,
}: {
  label: string;
  ayuda?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-medium text-carbon">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {ayuda && <span className="mt-1.5 block text-xs text-niebla">{ayuda}</span>}
    </label>
  );
}

/** Input de una línea con prefijo/sufijo opcionales (p. ej. "$" y "COP"). */
export function Entrada({
  prefijo,
  sufijo,
  className,
  ...props
}: React.ComponentProps<"input"> & { prefijo?: string; sufijo?: string }) {
  return (
    <span className="relative flex items-center">
      {prefijo && (
        <span className="pointer-events-none absolute left-3.5 text-sm text-niebla">
          {prefijo}
        </span>
      )}
      <input
        {...props}
        className={cn(
          estiloInput,
          alturaInput,
          prefijo && "pl-8",
          sufijo && "pr-14",
          className,
        )}
      />
      {sufijo && (
        <span className="pointer-events-none absolute right-3.5 text-xs font-medium text-niebla">
          {sufijo}
        </span>
      )}
    </span>
  );
}

export function AreaTexto({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={cn(estiloInput, "resize-y py-2.5 leading-relaxed", className)} />
  );
}

export function Selector({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={cn(estiloInput, alturaInput, "cursor-pointer pr-8", className)}
    >
      {children}
    </select>
  );
}

/** Interruptor tipo iOS con título y descripción. */
export function Interruptor({
  checked,
  onChange,
  titulo,
  descripcion,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  titulo: string;
  descripcion?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-medium text-carbon">{titulo}</span>
        {descripcion && <span className="mt-0.5 block text-xs text-niebla">{descripcion}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-champagne",
          checked ? "bg-verde-golf" : "bg-arena",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

/** Píldora seleccionable (para elegir varios elementos de un catálogo). */
export function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        activo
          ? "border-verde-golf bg-verde-golf text-crema"
          : "border-arena bg-white text-carbon hover:border-verde-golf/50",
      )}
    >
      {children}
    </button>
  );
}

export function AlertaError({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-error/20 bg-error/5 px-3.5 py-2.5 text-sm text-error"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/** Barra de acciones fija al pie: el botón Guardar siempre a la vista. */
export function BarraGuardar({
  pending,
  etiqueta,
  onGuardar,
  onEliminar,
  error,
}: {
  pending: boolean;
  etiqueta: string;
  onGuardar: () => void;
  onEliminar?: () => void;
  error?: string | null;
}) {
  return (
    <div className="sticky bottom-4 z-10 space-y-2">
      {error && <AlertaError>{error}</AlertaError>}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-arena bg-blanco-roto/90 p-3 shadow-[var(--shadow-elevada)] backdrop-blur">
        {onEliminar ? (
          <button
            type="button"
            onClick={onEliminar}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-error transition-colors hover:bg-error/10 disabled:opacity-40"
          >
            <Trash2 size={15} /> Eliminar
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onGuardar}
          disabled={pending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-verde-golf px-6 text-sm font-medium text-crema shadow-sm transition-colors hover:bg-verde-calle disabled:opacity-60"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {pending ? "Guardando…" : etiqueta}
        </button>
      </div>
    </div>
  );
}
