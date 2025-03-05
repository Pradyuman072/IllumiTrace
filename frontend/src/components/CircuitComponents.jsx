import React from 'react';
import { Group, Rect, Circle, Text } from 'react-konva';

export class CircuitComponent {
  constructor(type, symbol, color, width, height, terminals, defaultValue) {
    this.id = `${type}_${Date.now()}`;
    this.type = type;
    this.symbol = symbol;
    this.color = color;
    this.width = width;
    this.height = height;
    this.terminals = terminals;
    this.value = defaultValue;
    this.x = 100; // Default x position
    this.y = 100; // Default y position
  }

  renderComponent(props) {
    const {
      x,
      y,
      isSelected,
      onTerminalClick,
    } = props;

    return (
      <Group
        x={x}
        y={y}
        draggable
      >
        <Rect
          width={this.width}
          height={this.height}
          fill={this.color}
          stroke={isSelected ? "#00FFFF" : "#000"}
          strokeWidth={isSelected ? 2 : 1}
          cornerRadius={5}
        />

        <Text
          text={`${this.symbol} ${this.type}`}
          x={this.width / 2 - 20}
          y={this.height / 2 - 7}
          fontSize={14}
          fill="#000"
        />

        {this.terminals.map((terminal, index) => (
          <Circle
            key={`term_${index}`}
            x={terminal.x}
            y={terminal.y}
            radius={6}
            fill="#333"
            stroke="#000"
            onClick={() => onTerminalClick(index)}
          />
        ))}
      </Group>
    );
  }
}

export const ComponentLibrary = {
  Resistor: new CircuitComponent(
    'Resistor', 
    '⚡', 
    '#FFA500', 
    80, 
    20, 
    [{x: 0, y: 10}, {x: 80, y: 10}], 
    '1k'
  ),
  Capacitor: new CircuitComponent(
    'Capacitor', 
    '⚙️', 
    '#87CEFA', 
    40, 
    60, 
    [{x: 20, y: 0}, {x: 20, y: 60}], 
    '10µF'
  ),
  LED: new CircuitComponent(
    'LED', 
    '💡', 
    '#FF0000', 
    30, 
    30, 
    [{x: 0, y: 15}, {x: 30, y: 15}], 
    'Red'
  ),
  Switch: new CircuitComponent(
    'Switch', 
    '🔌', 
    '#32CD32', 
    60, 
    30, 
    [{x: 0, y: 15}, {x: 60, y: 15}], 
    'SPST'
  ),
  Battery: new CircuitComponent(
    'Battery', 
    '🔋', 
    '#FFD700', 
    60, 
    40, 
    [{x: 0, y: 20}, {x: 60, y: 20}], 
    '9V'
  )
};