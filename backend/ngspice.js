const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class NgspiceSimulator {
  static async simulateCircuit(netlist) {
    const netlistPath = path.join(__dirname, `circuit_${Date.now()}.net`);

    try {
      // Write netlist to file
      await fs.writeFile(netlistPath, netlist);

      return new Promise((resolve, reject) => {
        // Spawn ngspice process
        const ngspiceProcess = spawn('ngspice', ['-b', netlistPath]);

        let output = '';
        let errorOutput = '';

        ngspiceProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        ngspiceProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        ngspiceProcess.on('close', async (code) => {
          // Clean up temporary netlist file
          await fs.unlink(netlistPath).catch(console.error);

          if (code !== 0) {
            reject(new Error(`Ngspice simulation failed: ${errorOutput}`));
            return;
          }

          try {
            const results = this.parseSimulationOutput(output);
            resolve(results);
          } catch (parseError) {
            reject(parseError);
          }
        });
      });
    } catch (error) {
      console.error('Simulation setup error:', error);
      throw error;
    }
  }

  static parseSimulationOutput(output) {
    const results = {
      status: 'success',
      voltages: {},
      currents: {},
      rawOutput: output
    };

    // More robust parsing logic
    const lines = output.split('\n');
    lines.forEach(line => {
      const voltageMatch = line.match(/v\((\w+)\)\s*=\s*([-\d.e+]+)/i);
      const currentMatch = line.match(/i\(([vrc]\w+)\)\s*=\s*([-\d.e+]+)/i);

      if (voltageMatch) {
        results.voltages[voltageMatch[1]] = parseFloat(voltageMatch[2]);
      }

      if (currentMatch) {
        results.currents[currentMatch[1]] = parseFloat(currentMatch[2]);
      }
    });

    return results;
  }
}

module.exports = NgspiceSimulator;