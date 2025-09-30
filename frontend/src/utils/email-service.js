/**
 * Email service utility for CrimeGrid city requests
 * No authentication required - uses public API endpoint
 */

/**
 * Sends city request via public API endpoint
 * 
 * @param {Object} formData - The form data to send
 * @returns {Promise} - A promise that resolves when the email is sent
 */
export const sendCityRequest = async (formData) => {
  try {
    // For development, log the request
    console.log('City Request:', formData);
    
    // TODO: Replace with actual Lambda API Gateway endpoint
    // const response = await fetch('https://api.crimegrid.ai/city-request', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     city: formData.city,
    //     email: formData.email,
    //     timestamp: new Date().toISOString()
    //   })
    // });
    
    // Simulate successful submission for now
    return { success: true, messageId: 'dev-' + Date.now() };
    
  } catch (error) {
    console.error('Error sending city request:', error);
    throw error;
  }
};