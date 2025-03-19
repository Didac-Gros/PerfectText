export function AnimatedArrow() {
  return (
    <div className="flex items-center justify-center">
      <svg
        className="w-12 h-12 text-gray-500 animate-bounce"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  );
}
