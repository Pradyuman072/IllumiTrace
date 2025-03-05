import React, { useState, useEffect } from 'react';

const CircuitChecklist = ({ components, connections, simulationResults }) => {
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    // Create a checklist based on the components added
    const updatedChecklist = components.map((component, index) => ({
      id: index + 1, // Unique ID for each component
      text: `Add ${component.type}`, // Display the type of the component
      completed: false, // Initially not completed
    }));

    // Add additional checklist items for connections and simulation
    updatedChecklist.push(
      { id: components.length + 1, text: 'Connect Components', completed: connections.length > 0 },
     
      { id: components.length + 3, text: 'Run Simulation', completed: !!simulationResults }
    );

    setChecklist(updatedChecklist);
  }, [components, connections, simulationResults]);

  const toggleChecklistItem = (id) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="circuit-checklist">
      <h3 className="text-lg font-bold text-center pb-3 border-b-2 border-circuit-highlight mb-4">
        Design Checklist
      </h3>
      {checklist.map(item => (
        <div
          key={item.id}
          className="flex items-center p-2 border-b border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => toggleChecklistItem(item.id)}
            className="mr-3 h-4 w-4 text-circuit-highlight focus:ring-circuit-highlight"
          />
          <span
            className={`
              flex-grow
              ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}
            `}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CircuitChecklist;