/** Consistent stroke icons for the mobile tab bar (unicode glyphs render unevenly on iOS). */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export function NavIcon({ name }: { name: "dukkan" | "uretim" | "siparis" | "ustalik" | "basarim" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      {name === "dukkan" && (<><circle cx="12" cy="12" r="8.5" {...P} /><circle cx="12" cy="12" r="3.5" {...P} /></>)}
      {name === "uretim" && (<><path d="M4 20V10l5 3V10l5 3V6h6v14z" {...P} /><path d="M8 17h2M13 17h2" {...P} /></>)}
      {name === "siparis" && (<><rect x="5" y="4" width="14" height="16" rx="2" {...P} /><path d="M9 9h6M9 13h6M9 17h3" {...P} /></>)}
      {name === "ustalik" && (<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" {...P} />)}
      {name === "basarim" && (<><path d="M8 4h8v5a4 4 0 0 1-8 0z" {...P} /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8" {...P} /></>)}
    </svg>
  );
}
