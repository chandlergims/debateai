// This script will be executed by the server to run the cron job every minute
const cron = require('node-cron');
const fetch = require('node-fetch');

// Schedule the cron job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running cron job to wipe all topics...');
  
  try {
    // Call the cron API endpoint
    const response = await fetch('http://localhost:3000/api/cron');
    const data = await response.json();
    
    console.log('Cron job result:', data);
  } catch (error) {
    console.error('Error running cron job:', error);
  }
});

console.log('Cron job scheduler started. Will wipe all topics every minute.');
