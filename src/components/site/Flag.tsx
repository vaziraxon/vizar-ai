import type { FlagCode } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

// Simplified, icon-scale flags drawn in a 24×24 box and clipped to a circle.
// Inline SVG keeps them crisp on every OS (emoji flags render as letters on
// Windows) without loading external assets.
function FlagArt({ code }: { code: FlagCode }) {
  switch (code) {
    case "uz":
      return (
        <>
          <rect width="24" height="8" fill="#0099B5" />
          <rect y="8" width="24" height="8" fill="#FFFFFF" />
          <rect y="16" width="24" height="8" fill="#1EB53A" />
          <rect y="7.4" width="24" height="0.8" fill="#CE1126" />
          <rect y="15.8" width="24" height="0.8" fill="#CE1126" />
          <circle cx="7.4" cy="4" r="2.4" fill="#FFFFFF" />
          <circle cx="8.3" cy="4" r="2" fill="#0099B5" />
        </>
      );
    case "ru":
      return (
        <>
          <rect width="24" height="8" fill="#FFFFFF" />
          <rect y="8" width="24" height="8" fill="#0039A6" />
          <rect y="16" width="24" height="8" fill="#D52B1E" />
        </>
      );
    case "fr":
      return (
        <>
          <rect width="8" height="24" fill="#0055A4" />
          <rect x="8" width="8" height="24" fill="#FFFFFF" />
          <rect x="16" width="8" height="24" fill="#EF4135" />
        </>
      );
    case "it":
      return (
        <>
          <rect width="8" height="24" fill="#009246" />
          <rect x="8" width="8" height="24" fill="#FFFFFF" />
          <rect x="16" width="8" height="24" fill="#CE2B37" />
        </>
      );
    case "de":
      return (
        <>
          <rect width="24" height="8" fill="#111111" />
          <rect y="8" width="24" height="8" fill="#DD0000" />
          <rect y="16" width="24" height="8" fill="#FFCE00" />
        </>
      );
    case "us":
      return (
        <>
          <rect width="24" height="24" fill="#FFFFFF" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} y={i * 3.43} width="24" height="1.72" fill="#B22234" />
          ))}
          <rect width="11.5" height="12" fill="#3C3B6E" />
          {[2.2, 5, 7.8].map((cx) =>
            [2.4, 5.4, 8.4].map((cy) => <circle key={`${cx}-${cy}`} cx={cx + 0.6} cy={cy} r="0.75" fill="#FFFFFF" />)
          )}
        </>
      );
    case "gb":
      return (
        <>
          <rect width="24" height="24" fill="#012169" />
          <path d="M0 0L24 24M24 0L0 24" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="1.8" />
          <path d="M12 0V24M0 12H24" stroke="#FFFFFF" strokeWidth="7" />
          <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="4" />
        </>
      );
    case "ca":
      return (
        <>
          <rect width="24" height="24" fill="#FFFFFF" />
          <rect width="6" height="24" fill="#D80621" />
          <rect x="18" width="6" height="24" fill="#D80621" />
          <path
            d="M12 5.2l1.1 2.2 1.3-.5-.4 2.7 1.9-1.6.4 1.2 1.6-.3-.7 1.9.8.4-2.6 2.1.4 1.1-2.7-.4V17h-1.2v-3l-2.7.4.4-1.1-2.6-2.1.8-.4-.7-1.9 1.6.3.4-1.2 1.9 1.6-.4-2.7 1.3.5z"
            fill="#D80621"
          />
        </>
      );
    case "jp":
      return (
        <>
          <rect width="24" height="24" fill="#FFFFFF" />
          <circle cx="12" cy="12" r="5.4" fill="#BC002D" />
        </>
      );
    case "kr":
      return (
        <>
          <rect width="24" height="24" fill="#FFFFFF" />
          <path d="M7.2 12a4.8 4.8 0 0 1 9.6 0 2.4 2.4 0 0 1-4.8 0 2.4 2.4 0 0 0-4.8 0z" fill="#CD2E3A" />
          <path d="M16.8 12a4.8 4.8 0 0 1-9.6 0 2.4 2.4 0 0 1 4.8 0 2.4 2.4 0 0 0 4.8 0z" fill="#0047A0" />
          <g stroke="#111111" strokeWidth="0.9" strokeLinecap="round">
            <path d="M3.6 7.2l2-2.8M4.5 7.9l2-2.8M5.4 8.5l2-2.8" />
            <path d="M16.6 18.3l2-2.8M17.5 18.9l2-2.8M18.4 19.6l2-2.8" />
            <path d="M3.6 16.8l2 2.8M4.5 16.1l2 2.8M5.4 15.5l2 2.8" />
            <path d="M16.6 5.7l2 2.8M17.5 5.1l2 2.8M18.4 4.4l2 2.8" />
          </g>
        </>
      );
    case "ae":
      return (
        <>
          <rect width="24" height="8" fill="#00732F" />
          <rect y="8" width="24" height="8" fill="#FFFFFF" />
          <rect y="16" width="24" height="8" fill="#111111" />
          <rect width="7" height="24" fill="#FF0000" />
        </>
      );
    case "tr":
      return (
        <>
          <rect width="24" height="24" fill="#E30A17" />
          <circle cx="10" cy="12" r="5.2" fill="#FFFFFF" />
          <circle cx="11.3" cy="12" r="4.2" fill="#E30A17" />
          <path d="M15.6 12l2.9-.95-1.8 2.47V10.5l1.8 2.47z" fill="#FFFFFF" />
        </>
      );
    case "eu":
    default:
      return (
        <>
          <rect width="24" height="24" fill="#003399" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            // Rounded so server and client render identical attribute strings
            const cx = Math.round((12 + 6.2 * Math.sin(a)) * 1000) / 1000;
            const cy = Math.round((12 - 6.2 * Math.cos(a)) * 1000) / 1000;
            return <circle key={i} cx={cx} cy={cy} r="0.95" fill="#FFCC00" />;
          })}
        </>
      );
  }
}

export function Flag({ code, size = 32, className }: { code: FlagCode; size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/10",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size} height={size} preserveAspectRatio="xMidYMid slice">
        <FlagArt code={code} />
      </svg>
    </span>
  );
}
