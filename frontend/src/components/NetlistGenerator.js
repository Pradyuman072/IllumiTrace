export class NetlistGenerator {
  constructor() {
    this.nodeMap = new Map();
    this.nodeCounter = 1;
  }

  // Parse component values with units
  parseValueWithUnit(value) {
    if (typeof value !== 'string') return value;
    
    const match = value.match(/^(\d+(?:\.\d+)?)\s*([kmunp])?/i);
    if (!match) return value;
    
    const number = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase();
    
    switch(unit) {
      case 'k': return number * 1000;
      case 'm': return number * 1000000;
      case 'u': return number * 0.000001;
      case 'n': return number * 0.000000001;
      case 'p': return number * 0.000000000001;
      default: return number;
    }
  }

  // Generate Ngspice compatible netlist
  generateNetlist(components, connections) {
    // Reset node mapping
    this.nodeMap.clear();
    this.nodeCounter = 1;
    this.nodeMap.set('gnd', 0);

    // Assign nodes to components
    this.assignNodes(connections);

    let netlist = `* Circuit Netlist Generated\n`;
    
    // Add components to netlist
    components.forEach(comp => {
      const compType = comp.type.toLowerCase();
      const compValue = this.parseValueWithUnit(comp.value);
      
      const node1 = this.getNodeForComponent(comp, 0);
      const node2 = this.getNodeForComponent(comp, 1);
      
      switch(compType) {
        case 'resistor':
          netlist += `R${comp.id} ${node1} ${node2} ${compValue}\n`;
          break;
        case 'capacitor':
          netlist += `C${comp.id} ${node1} ${node2} ${compValue}\n`;
          break;
        case 'led':
          netlist += `D${comp.id} ${node1} ${node2} LED\n`;
          break;
        case 'switch':
          netlist += `R${comp.id} ${node1} ${node2} 0.1\n`; // Assume closed
          break;
        case 'battery':
          netlist += `V${comp.id} ${node1} ${node2} DC ${compValue}\n`;
          break;
      }
    });
    
    // Add models and simulation commands
    netlist += `.model LED D(Is=1e-22 Rs=5 N=1.8 Cjo=10p Vj=0.7 Fc=0.5 Bv=5 Ibv=10u)\n`;
    netlist += `.option TEMP=27\n`;
    netlist += `.option NOMELT\n`;
    netlist += `.control\n`;
    netlist += `op\n`;  // Operating point analysis
    netlist += `print all\n`;
    netlist += `.endc\n`;
    netlist += `.end\n`;
    
    return netlist;
  }

  // Assign unique nodes to connections
  assignNodes(connections) {
    connections.forEach(conn => {
      const fromKey = `${conn.fromComponent.id}_${conn.fromTerminal}`;
      const toKey = `${conn.toComponent.id}_${conn.toTerminal}`;
      
      if (!this.nodeMap.has(fromKey) && !this.nodeMap.has(toKey)) {
        this.nodeMap.set(fromKey, this.nodeCounter);
        this.nodeMap.set(toKey, this.nodeCounter);
        this.nodeCounter++;
      } else if (this.nodeMap.has(fromKey) && !this.nodeMap.has(toKey)) {
        this.nodeMap.set(toKey, this.nodeMap.get(fromKey));
      } else if (!this.nodeMap.has(fromKey) && this.nodeMap.has(toKey)) {
        this.nodeMap.set(fromKey, this.nodeMap.get(toKey));
      }
    });
  }

  // Get node for a specific component terminal
  getNodeForComponent(component, terminalIndex) {
    const key = `${component.id}_${terminalIndex}`;
    return this.nodeMap.get(key) || this.nodeCounter++;
  }
}

export default NetlistGenerator;