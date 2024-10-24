const Papa = require('papaparse');

async function arrayObjectToCSVBuffer(arrayOfObjects) {
  // Convert to CSV
  const csv = Papa.unparse(arrayOfObjects);

  // Encode as base64
  const base64String = Buffer.from(csv).toString('base64');
  
  return base64String;
}

async function arrayObjectToCSVBufferFile(arrayOfObjects) {
  // Convert to CSV
  const csv = Papa.unparse(arrayOfObjects);

  return csv;
}






module.exports = {arrayObjectToCSVBuffer,arrayObjectToCSVBufferFile}