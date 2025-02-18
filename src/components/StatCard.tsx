
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  sublabel: string;
}

export const StatCard = ({ icon, value, label, sublabel }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="text-4xl font-bold">{value}</div>
        <div className="text-indigo-600">{icon}</div>
      </div>
      <div className="mt-2">
        <div className="font-semibold text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{sublabel}</div>
      </div>
    </div>
  );
};
