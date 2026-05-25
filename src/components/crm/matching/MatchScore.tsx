interface Props {
  score: number;
}

export function MatchScore({ score }: Props) {
  const color =
    score >= 70
      ? "bg-green-100 text-green-800"
      : score >= 40
      ? "bg-amber-100 text-amber-800"
      : "bg-gray-100 text-gray-600";

  return (
    <div className={`rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0 ${color}`}>
      {score}%
    </div>
  );
}
