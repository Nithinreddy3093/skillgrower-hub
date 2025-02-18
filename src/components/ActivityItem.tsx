
interface ActivityItemProps {
  title: string;
  time: string;
  points: number;
}

export const ActivityItem = ({ title, time, points }: ActivityItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
      <div className="text-green-500 font-semibold">+{points}</div>
    </div>
  );
};
