/**
 * Fixed full-viewport paper backdrop for the Leo app — aged parchment wash,
 * a fine fibre grain, and a soft vignette. Sits behind all content so every
 * screen feels like it's printed on warm paper.
 */
export function PaperBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="leo-aurora absolute inset-0" />
      <div className="leo-grain absolute inset-0 opacity-[0.06] mix-blend-multiply" />
      <div className="leo-vignette absolute inset-0" />
    </div>
  );
}
