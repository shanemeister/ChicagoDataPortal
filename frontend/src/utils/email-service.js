/**
 * Email service utility for CrimeGrid city requests
 * Uses simple mailto approach like Fox River AI
 */

/**
 * Sends city request via mailto (opens user's email client)
 * 
 * @param {Object} formData - The form data to send
 * @returns {Promise} - A promise that resolves immediately
 */
export const sendCityRequest = async (formData) => {
  const subject = encodeURIComponent(`CrimeGrid.ai - City Request: ${formData.city}`);
  const body = encodeURIComponent(`
Please add the following city to CrimeGrid.ai:

City: ${formData.city}
Requested by: ${formData.email}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Submitted via: https://crimegrid.ai
  `);
  
  window.location.href = `mailto:info@relufox.ai?subject=${subject}&body=${body}`;
  
  return { success: true, messageId: 'mailto-' + Date.now() };
};