// Simple line icons for the service cards and production stages (they follow the text colour).
const paths = {
  spark: <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />,
  clap: (
    <>
      <path d="M3 9h18v11H3z" />
      <path d="m3 9 2.5-5 15 3L21 9" />
      <path d="m8.5 4.6 2 3.8M14 5.7l2 3.7" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="m10.5 9 4 3-4 3z" />
    </>
  ),
  script: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4M9 11h7M9 14.5h7M9 18h4" />
    </>
  ),
  screen: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="1.5" />
      <path d="M8 21h8M12 17v4" />
      <circle cx="12" cy="10.5" r="3" />
      <path d="M12 7.5v6M9.4 9l5.2 3M9.4 12l5.2-3" />
    </>
  ),
};

export default function LineIcon({ name, size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
