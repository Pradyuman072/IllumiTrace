import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CircuitSimulator from './components/CircuitSimulator';
import "./index.css"
function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <CircuitSimulator />
      </div>
    </DndProvider>
  );
}

export default App;