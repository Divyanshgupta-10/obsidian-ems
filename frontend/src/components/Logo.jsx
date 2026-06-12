const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <polygon points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5"
      stroke="#6366F1" strokeWidth="1.5" opacity="0.7"/>
    <polygon points="24,10 37,17.5 37,30.5 24,38 11,30.5 11,17.5"
      stroke="#818CF8" strokeWidth="1" opacity="0.4"/>
    <circle cx="24" cy="24" r="5" fill="#6366F1"/>
    <circle cx="24" cy="24" r="5" fill="#6366F1" opacity="0.4"
      style={{filter:'blur(6px)'}}/>
  </svg>
);

export default Logo;
