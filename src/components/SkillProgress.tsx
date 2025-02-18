
interface SkillProgressProps {
  skill: string;
  progress: number;
  color?: "blue" | "green";
}

export const SkillProgress = ({ skill, progress, color = "blue" }: SkillProgressProps) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-700">{skill}</span>
        <span className="text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
