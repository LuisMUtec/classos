import { SubLabel } from './StudentSection';

export function ExtensionsChips({ extensions }: { extensions: string[] }) {
  return (
    <div>
      <SubLabel>Extensiones (alumnos rápidos)</SubLabel>
      <div className="space-y-1.5">
        {extensions.map((e, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-[13px] text-foreground/80 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
          >
            <span className="text-amber-600 font-bold shrink-0">+</span>
            <span className="leading-snug">{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
