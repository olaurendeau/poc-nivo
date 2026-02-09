type IconProps = { className?: string };

export const IconAvalanche = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L4 18h3l5-8 5 8h3L12 2z" />
  </svg>
);

export const IconFissure = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 20 L10 8 L16 16 L22 4" />
  </svg>
);

export const IconWoumpf = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 14h2v4H3v-4zm4-2h2v6H7v-6zm4-2h2v8h-2V10zm4-2h2v10h-2V8zm4-4h2v14h-2V4z" />
  </svg>
);
