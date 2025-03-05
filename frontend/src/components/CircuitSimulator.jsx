import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ComponentSidebar from './ComponentSidebar';
import CircuitCanvas from './CircuitCanvas';
import CircuitChecklist from './CircuitChecklist';
import { CircuitComponent } from './CircuitComponents'; // Ensure this import is correct

const CircuitSimulator = () => {
  const [components, setComponents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [simulationResults, setSimulationResults] = useState(null);

  const addComponent = (component) => {
    const newComponent = new CircuitComponent(
      component.type,
      component.symbol,
      component.color,
      component.width,
      component.height,
      component.terminals,
      component.value
    );
    setComponents(prev => [...prev, newComponent]);
  };

  const addConnection = (connection) => {
    setConnections(prev => [...prev, connection]);
  };

  const runSimulation = async () => {
    try {
      const ws = new WebSocket('ws://localhost:3000');

      ws.onopen = () => {
        const simulationData = {
          components,
          connections
        };
        ws.send(JSON.stringify(simulationData));
      };

      ws.onmessage = (event) => {
        const results = JSON.parse(event.data);
        setSimulationResults(results);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Simulation Error:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen overflow-hidden">
        <div className="w-64 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
          <ComponentSidebar onComponentAdd={addComponent} />
        </div>
        <div className="flex-grow relative bg-white flex justify-center items-center">
          <CircuitCanvas
            components={components}
            connections={connections}
            onComponentAdd={addComponent}
            onConnectionAdd={addConnection}
          />
        </div>
        <div className="w-64 bg-gray-50 p-4 border-l border-gray-200 overflow-y-auto">
          <CircuitChecklist
            components={components}
            connections={connections}
            simulationResults={simulationResults}
          />
          {simulationResults && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <h4>Simulation Results:</h4>
              <pre>{JSON.stringify(simulationResults, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default CircuitSimulator;