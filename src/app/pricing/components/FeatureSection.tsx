import type { FeatureSectionProps } from "../types";

export function FeatureSection({
  title,
  features,
  color,
}: FeatureSectionProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="flex flex-col">
      <h4 className="mb-3 flex items-center text-sm font-semibold tracking-wider text-gray-400 uppercase">
        <span className={`mr-2 h-0.5 w-5 ${colorClasses[color]}`}></span>
        {title}
      </h4>
      <ul className="flex-1 space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <span className="text-gray-300">{feature.name}</span>
            <span className="font-medium text-white">{feature.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
