import { OllamaProvider } from './src/ai/providers/ollama.provider.ts';
import { z } from 'zod';

const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'qwen2.5:7b';
const TIMEOUT_MS = 60000;

async function runTests() {
  console.log('--- PHASE 1: OLLAMA VERIFICATION ---');
  const provider = new OllamaProvider(OLLAMA_URL, MODEL, TIMEOUT_MS);
  
  try {
    console.log(`\n1. Testing Connection to ${OLLAMA_URL}...`);
    const conn = await provider.testConnection();
    console.log(`Connection successful: ${conn.success}, Latency: ${conn.latencyMs}ms`);
    
    if (!conn.success) {
      console.error('FAILED TO CONNECT TO OLLAMA.');
      process.exit(1);
    }

    console.log(`\n2. Testing Basic Text Generation (${MODEL})...`);
    const t0 = Date.now();
    const textRes = await provider.generateText('Say exactly "Hello LifeOS"');
    const t1 = Date.now();
    console.log(`Response: ${textRes}`);
    console.log(`Latency: ${t1 - t0}ms`);

    console.log(`\n3. Testing Structured Generation (${MODEL})...`);
    const schema = z.object({
      title: z.string(),
      summary: z.string()
    });
    
    const s0 = Date.now();
    const structRes = await provider.generateStructured('Output a JSON object with title "Test Goal" and summary "Test summary"');
    const s1 = Date.now();
    
    console.log('Raw Structured Output:', structRes);
    const validated = schema.parse(structRes);
    console.log('Zod Validated Output:', validated);
    console.log(`Latency: ${s1 - s0}ms`);

  } catch (error) {
    console.error('ERROR DURING TESTS:', error.message);
  }
}

runTests();

async function runFailureTests() {
  console.log('\n--- PHASE 1: FAILURE HANDLING ---');
  
  // 1. Invalid Model Test
  console.log('\n1. Testing Invalid Model...');
  const invalidModelProvider = new OllamaProvider(OLLAMA_URL, 'fake-model-123', TIMEOUT_MS);
  try {
    await invalidModelProvider.generateText('Hello?');
    console.error('FAIL: Should have thrown an error for invalid model.');
  } catch (error) {
    console.log('SUCCESS: Caught invalid model error.');
    console.log('Error Message:', error.message);
  }

  // 2. Unavailable Provider Test
  console.log('\n2. Testing Unavailable Ollama Endpoint...');
  const unavailableProvider = new OllamaProvider('http://localhost:9999', MODEL, 2000); // short timeout
  try {
    await unavailableProvider.generateText('Hello?');
    console.error('FAIL: Should have thrown an error for unavailable endpoint.');
  } catch (error) {
    console.log('SUCCESS: Caught unavailable endpoint error.');
    console.log('Error Message:', error.message);
  }
}

runFailureTests();
