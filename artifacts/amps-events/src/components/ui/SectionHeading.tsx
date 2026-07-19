interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}
export function SectionHeading({ eyebrow, title, subtitle, centered = false }: SectionHeadingProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">{eyebrow}</p>}
      <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
      {subtitle && <p className="text-white/60 text-lg max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}