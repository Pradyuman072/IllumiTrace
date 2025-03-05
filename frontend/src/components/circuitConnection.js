export class CircuitConnection {
    constructor(fromComponent, fromTerminal, toComponent, toTerminal) {
      this.id = `conn_${Date.now()}`;
      this.fromComponent = fromComponent;
      this.fromTerminal = fromTerminal;
      this.toComponent = toComponent;
      this.toTerminal = toTerminal;
    }
  
    getConnectionPoints() {
      return {
        from: {
          x: this.fromComponent.x + this.fromComponent.terminals[this.fromTerminal].x,
          y: this.fromComponent.y + this.fromComponent.terminals[this.fromTerminal].y
        },
        to: {
          x: this.toComponent.x + this.toComponent.terminals[this.toTerminal].x,
          y: this.toComponent.y + this.toComponent.terminals[this.toTerminal].y
        }
      };
    }
  }