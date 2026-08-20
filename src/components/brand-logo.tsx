import { cn } from "@/lib/utils";
import LogoImage from "@/assets/Images/logo.png";

/**
 * Brand mark framed to match the dark gold theme.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex overflow-hidden rounded-xl border border-border bg-card shadow-card ring-1 ring-primary/30",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15"
      />
      <img
        src={LogoImage}
        alt="IntervuHub — prepare, practice, succeed"
        className="relative h-full w-full scale-[1.42] object-cover object-center"
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
