/**
 * bondova-MOR Entry Point
 * 
 * Main application entry point for the analysis motor system.
 * Skape generates ideas → Motor analyzes them → Results stored
 */

import 'dotenv/config.js';
import GrokMotor from './motor/grok-engine.js';

console.log('bondova-MOR starting...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Initialize Grok Analysis Motor
let motor = null;

try {
  motor = new GrokMotor(process.env.GROK_API_KEY);
  console.log('✓ Grok Analysis Motor initialized');
} catch (error) {
  console.error('✗ Failed to initialize Grok Motor:', error.message);
  process.exit(1);
}

// Main application logic
export default {
  start: async () => {
    console.log('Application started');
    console.log('Ready to analyze ideas from Skape');
    
    // Example: analyze an idea
    if (process.argv[2] === '--demo') {
      const exampleIdea = {
        id: 'demo-1',
        title: 'AI-powered idea analysis',
        description: 'A system that uses AI to analyze and evaluate ideas from Skape',
        tags: ['AI', 'analysis', 'ideas']
      };
      
      try {
        console.log('\nAnalyzing example idea...');
        const analysis = await motor.analyze(exampleIdea);
        console.log('\nAnalysis Result:');
        console.log(analysis);
      } catch (error) {
        console.error('Error during analysis:', error.message);
      }
    }
  },
  
  stop: async () => {
    console.log('Application stopped');
  },
  
  // Export motor for use by other modules
  getMotor: () => motor
};

// If run directly, start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = (await import('./index.js')).default;
  await app.start();
}
