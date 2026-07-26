/** Light-theme AWS wordmark (black text + orange smile) for IAM sign-in. */
export function AwsSignInLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 48"
      width="80"
      height="48"
      role="img"
      aria-label="AWS"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="40"
        y="28"
        textAnchor="middle"
        fontFamily='"Amazon Ember", "Helvetica Neue", Arial, sans-serif'
        fontWeight="700"
        fontSize="28"
        fill="#232f3e"
        letterSpacing="-0.5"
      >
        aws
      </text>
      <path
        d="M18 34c10 10 34 10 44 0"
        fill="none"
        stroke="#FF9900"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M56.5 30.5l7.5 3.5-4.2 7"
        fill="none"
        stroke="#FF9900"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
