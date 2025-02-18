
import { Target, Trophy, TrendingUp, Users } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { SkillProgress } from "@/components/SkillProgress";
import { ActivityItem } from "@/components/ActivityItem";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back, Alex!</h1>
          <p className="text-gray-600 mt-2">Track your progress and achieve your goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Trophy size={24} />}
            value="2,450"
            label="Total Points"
            sublabel="Level 5 Achiever"
          />
          <StatCard
            icon={<Target size={24} />}
            value="8"
            label="Active Goals"
            sublabel="2 nearly complete"
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            value="12"
            label="Skills Improved"
            sublabel="This month"
          />
          <StatCard
            icon={<Users size={24} />}
            value="3"
            label="Study Groups"
            sublabel="Active memberships"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Skill Progress</h2>
            <div className="space-y-4">
              <SkillProgress skill="Critical Thinking" progress={75} color="blue" />
              <SkillProgress skill="Time Management" progress={60} color="green" />
              <SkillProgress skill="Data Analysis" progress={45} color="blue" />
              <SkillProgress skill="Communication" progress={85} color="green" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-2">
              <ActivityItem
                title="Completed Python Course"
                time="2 hours ago"
                points={100}
              />
              <ActivityItem
                title="Group Study Session"
                time="Yesterday"
                points={50}
              />
              <ActivityItem
                title="New Goal Created"
                time="2 days ago"
                points={25}
              />
              <ActivityItem
                title="Badge Earned: Team Player"
                time="3 days ago"
                points={75}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
