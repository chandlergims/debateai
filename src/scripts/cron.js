// This script will be executed by the server to run the cron job every 5 minutes
const cron = require('node-cron');
const fetch = require('node-fetch');

// Schedule the cron job to run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running cron job to toggle between voting and debate periods...');
  
  try {
    // Call the cron API endpoint
    const response = await fetch('http://localhost:3000/api/cron');
    const data = await response.json();
    
    console.log('Cron job result:', data);
  } catch (error) {
    console.error('Error running cron job:', error);
  }
});

console.log('Cron job scheduler started. Will toggle between voting and debate periods every 5 minutes.');
