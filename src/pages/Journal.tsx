
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown } from "lucide-react";
import { toast } from "sonner";

const Journal = () => {
  const [mood, setMood] = useState<"happy" | "neutral" | "sad">();
  const [entry, setEntry] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skills = [
    "Critical Thinking",
    "Time Management",
    "Data Analysis",
    "Communication",
    "Problem Solving",
    "Leadership"
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood || !entry || selectedSkills.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Journal entry saved successfully!");
    setMood(undefined);
    setEntry("");
    setSelectedSkills([]);
  };

  const recentEntries = [
    {
      date: "Tuesday, February 18, 2025",
      content: "Today I made significant progress in my React studies. I learned about hooks and implemented them in my project. The concepts are becoming clearer, but I still need more practice with useEffect.",
      mood: "happy",
      skills: ["Critical Thinking", "Problem Solving"]
    },
    {
      date: "Monday, February 17, 2025",
      content: "Struggled with some complex algorithms today. While it was challenging, I learned a lot about different problem-solving approaches. Need to review time complexity concepts.",
      mood: "sad",
      skills: ["Problem Solving", "Data Analysis"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-gray-900">Learning Journal</h1>
        <p className="text-gray-600 mt-2 mb-8">Reflect on your learning journey and track your progress</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">New Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  How are you feeling about your progress today?
                </label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={mood === "happy" ? "default" : "outline"}
                    onClick={() => setMood("happy")}
                    className="flex-1"
                  >
                    <Smile className="mr-2" /> Good
                  </Button>
                  <Button
                    type="button"
                    variant={mood === "neutral" ? "default" : "outline"}
                    onClick={() => setMood("neutral")}
                    className="flex-1"
                  >
                    <Meh className="mr-2" /> Okay
                  </Button>
                  <Button
                    type="button"
                    variant={mood === "sad" ? "default" : "outline"}
                    onClick={() => setMood("sad")}
                    className="flex-1"
                  >
                    <Frown className="mr-2" /> Challenging
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="entry">
                  Reflect on your learning journey
                </label>
                <Textarea
                  id="entry"
                  placeholder="What did you learn today? What challenges did you face? What are your next steps?"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Related Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      onClick={() => toggleSkill(skill)}
                      size="sm"
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Save Journal Entry
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Entries</h2>
            <div className="space-y-6">
              {recentEntries.map((entry, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500">{entry.date}</span>
                    {entry.mood === "happy" && <Smile className="text-green-500" />}
                    {entry.mood === "neutral" && <Meh className="text-yellow-500" />}
                    {entry.mood === "sad" && <Frown className="text-red-500" />}
                  </div>
                  <p className="text-gray-700 mb-4">{entry.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
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

export default Journal;
