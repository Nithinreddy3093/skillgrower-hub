
interface AsideInfoProps {
  activeTopic: string;
  topicName: string;
}

export const AsideInfo = ({ activeTopic, topicName }: AsideInfoProps) => {
  return (
    <div className="p-4">
      <div className="space-y-4 text-sm">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h3 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">Topic Selected</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Currently asking about: <span className="font-medium">{topicName}</span>
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-1">How to use</h3>
          <ul className="space-y-2 list-disc pl-5 text-gray-600 dark:text-gray-400">
            <li>Select a topic from the sidebar</li>
            <li>Ask specific questions about concepts</li>
            <li>Request code examples or explanations</li>
            <li>Get help debugging problems</li>
            <li>Ask for study resources</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-1">Example questions</h3>
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <p>"Explain merge sort with an example"</p>
            <p>"What are pointers in C?"</p>
            <p>"How does virtual memory work in OS?"</p>
          </div>
        </div>
      </div>
    </div>
  );
};
