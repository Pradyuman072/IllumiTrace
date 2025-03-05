import React from 'react';
import { useDrag } from 'react-dnd';
import { ComponentLibrary } from './CircuitComponents';

const DraggableComponent = ({ component, onComponentAdd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CIRCUIT_COMPONENT',
    item: { ...component },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onComponentAdd({
          ...item,
          id: `${item.type}_${Date.now()}`,
          x: dropResult.x,
          y: dropResult.y
        });
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        p-3 mb-2 bg-circuit-component rounded-md cursor-grab text-center
        transition-circuit duration-300 ease-in-out
        ${isDragging ? 'opacity-50 scale-95' : 'hover:bg-gray-300'}
      `}
    >
      {component.symbol} {component.type}
    </div>
  );
};

const ComponentSidebar = ({ onComponentAdd }) => {
  const availableComponents = Object.values(ComponentLibrary);

  return (
    <div className="component-sidebar">
      <h3 className="text-lg font-bold text-center pb-3 border-b-2 border-circuit-highlight mb-4">
        Circuit Components
      </h3>
      {availableComponents.map((component) => (
        <DraggableComponent
          key={component.type}
          component={component}
          onComponentAdd={onComponentAdd}
        />
      ))}
    </div>
  );
};

export default ComponentSidebar;