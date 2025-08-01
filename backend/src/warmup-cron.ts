import cron from 'node-cron';
import axios from 'axios';

const PORT = process.env.PORT;
const BACKEND_URL = `http://0.0.0.0:${PORT}`;

// Function to ping the backend
async function pingBackend() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/health`);
    const istDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    console.log(`pinged successfully at ${istDate} (IST)`);
  } catch (error) {
    console.error(`failed to ping backend: ${error}`);
  }
}

// Schedule cron job to run every 20 minutes
export function startWarmupCron() {
  console.log('starting warmup cron job (every 20 minutes)');
  
  cron.schedule('*/20 * * * *', () => {
    pingBackend();
  });
  
  // Also ping immediately when starting
  pingBackend();
} 