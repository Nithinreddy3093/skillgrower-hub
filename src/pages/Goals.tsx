
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Goals = () => {
  const [goalName, setGoalName] = useState("");
  const [category, setCategory] = useState("academic");
  const [targetDate, setTargetDate] = useState<Date>();
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetDate || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Goal created successfully!");
    // Reset form
    setGoalName("");
    setCategory("academic");
    setTargetDate(undefined);
    setDescription("");
  };

  const goals = [
    {
      title: "Master React Hooks",
      category: "academic",
      progress: 75,
      dueDate: "4/1/2024",
      description: "Learn and implement all common React hooks in practical projects"
    },
    {
      title: "Improve Public Speaking",
      category: "soft",
      progress: 60,
      dueDate: "5/15/2024",
      description: "Practice presenting technical topics to different audiences"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-gray-900">Goal Setting</h1>
        <p className="text-gray-600 mt-2 mb-8">Set SMART goals to track your progress and achieve your aspirations</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Create New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="goalName">
                  Goal Name
                </label>
                <Input
                  id="goalName"
                  placeholder="e.g., Master Python Programming"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={category === "academic" ? "default" : "outline"}
                    onClick={() => setCategory("academic")}
                  >
                    🎓 Academic
                  </Button>
                  <Button
                    type="button"
                    variant={category === "soft" ? "default" : "outline"}
                    onClick={() => setCategory("soft")}
                  >
                    👥 Soft Skill
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Date</label>
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  className="rounded-md border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal and what you want to achieve..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">Create Goal</Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Your Goals</h2>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{goal.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        goal.category === "academic" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}>
                        {goal.category === "academic" ? "academic" : "soft"}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{goal.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          goal.category === "academic" ? "bg-blue-500" : "bg-green-500"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Due {goal.dueDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Goals;
