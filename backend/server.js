const WebSocket = require('ws');
const NgspiceSimulator = require('./ngspice');

class CircuitSimulationServer {
  constructor(port = 3000) {
    this.port = port;
    this.wss = new WebSocket.Server({ port });
    this.setupServer();
  }

  setupServer() {
    this.wss.on('connection', (ws) => {
      console.log('Client connected');
      
      ws.on('message', async (message) => {
        try {
          // Parse incoming circuit data
          const circuitData = JSON.parse(message);
          
          // Generate netlist from circuit data
          const netlist = this.generateNetlist(circuitData);
          
          // Run simulation
          const simulationResults = await NgspiceSimulator.simulateCircuit(netlist);
          
          // Send results back to client
          ws.send(JSON.stringify(simulationResults));
        } catch (error) {
          console.error('Simulation error:', error);
          ws.send(JSON.stringify({
            status: 'error',
            message: error.toString()
          }));
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    console.log(`WebSocket server running on port ${this.port}`);
  }

  generateNetlist(circuitData) {
    let netlist = `* Circuit Simulation Netlist\n`;
    const nodeMap = new Map();
    let nodeCounter = 1;

    // Set ground node
    nodeMap.set('gnd', 0);

    // Assign nodes
    circuitData.connections.forEach(conn => {
      const fromKey = `${conn.fromComponent.id}_${conn.fromTerminal}`;
      const toKey = `${conn.toComponent.id}_${conn.toTerminal}`;
      
      if (!nodeMap.has(fromKey) && !nodeMap.has(toKey)) {
        nodeMap.set(fromKey, nodeCounter);
        nodeMap.set(toKey, nodeCounter);
        nodeCounter++;
      }
    });

    // Add components
    circuitData.components.forEach(comp => {
      const node1 = this.getNodeForComponent(nodeMap, comp, 0, nodeCounter);
      const node2 = this.getNodeForComponent(nodeMap, comp, 1, nodeCounter);
      
      const value = this.parseValueWithUnit(comp.value);
      
      switch(comp.type) {
        case 'Resistor':
          netlist += `R${comp.id} ${node1} ${node2} ${value}\n`;
          break;
        case 'Capacitor':
          netlist += `C${comp.id} ${node1} ${node2} ${value}\n`;
          break;
        case 'LED':
          netlist += `D${comp.id} ${node1} ${node2} LED\n`;
          break;
        case 'Switch':
          netlist += `R${comp.id} ${node1} ${node2} 0.1\n`; // Closed switch
          break;
        case 'Battery':
          netlist += `V${comp.id} ${node1} ${node2} DC ${value}\n`;
          break;
      }
    });

    // Add simulation commands
    netlist += `.model LED D(Is=1e-22 Rs=5 N=1.8 Cjo=10p Vj=0.7 Fc=0.5 Bv=5 Ibv=10u)\n`;
    netlist += `.option TEMP=27\n`;
    netlist += `.control\n`;
    netlist += `op\n`;
    netlist += `print all\n`;
    netlist += `.endc\n`;
    netlist += `.end\n`;

    return netlist;
  }

  getNodeForComponent(nodeMap, comp, terminalIndex, nodeCounter) {
    const key = `${comp.id}_${terminalIndex}`;
    if (!nodeMap.has(key)) {
      nodeMap.set(key, nodeCounter);
      return nodeCounter++;
    }
    return nodeMap.get(key);
  }

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
}

// Start the server
const server = new CircuitSimulationServer();

module.exports = CircuitSimulationServer;