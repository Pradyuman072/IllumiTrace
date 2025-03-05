import React, { useState } from 'react';
import { Stage, Layer, Group, Line } from 'react-konva';
import { useDrop } from 'react-dnd';

const CircuitCanvas = ({
  components,
  connections,
  onComponentAdd,
  onConnectionAdd
}) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [connectionStart, setConnectionStart] = useState(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CIRCUIT_COMPONENT',
    drop: (item, monitor) => {
      const offset = monitor.getSourceClientOffset();
      return {
        x: offset.x,
        y: offset.y,
        width: 50,
        height: 30
      };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleComponentDragMove = (component, e) => {
    const updatedComponents = components.map(comp =>
      comp.id === component.id
        ? { ...comp, x: e.target.x(), y: e.target.y() }
        : comp
    );
    // Optionally update components
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  const handleTerminalClick = (component, terminalIndex) => {
    if (!connectionStart) {
      setConnectionStart({ component, terminalIndex });
    } else {
      onConnectionAdd({
        id: `connection_${Date.now()}`,
        start: connectionStart,
        end: { component, terminalIndex }
      });
      setConnectionStart(null);
    }
  };

  const renderConnections = () => {
    return connections.map(conn => {
      const points = conn.getConnectionPoints();
      return (
        <Line
          key={conn.id}
          points={[
            points.from.x, points.from.y, 
            points.to.x, points.to.y
          ]}
          stroke="#000"
          strokeWidth={2}
        />
      );
    });
  };

  return (
    <div
      ref={drop}
      className={`
        w-full h-full relative
        ${isOver ? 'bg-blue-50' : 'bg-white'}
        transition-colors duration-300
      `}
    >
      <Stage width={800} height={600}>
        <Layer>
          {components.map((comp) => (
            <Group
              key={comp.id}
              x={comp.x}
              y={comp.y}
              draggable
              onDragMove={(e) => handleComponentDragMove(comp, e)}
              onClick={() => handleComponentSelect(comp)}
            >
              {comp.renderComponent ? comp.renderComponent({
                x: 0,
                y: 0,
                isSelected: selectedComponent?.id === comp.id,
                onTerminalClick: (terminalIndex) => handleTerminalClick(comp, terminalIndex)
              }) : null}
            </Group>
          ))}
          {renderConnections()}
        </Layer>
      </Stage>
    </div>
  );
};

export default CircuitCanvas;