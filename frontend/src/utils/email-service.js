/**
 * Email service utility for CrimeGrid city requests
 * Uses Formspree for automatic email sending
 */

/**
 * Sends city request via Formspree
 * 
 * @param {Object} formData - The form data to send
 * @returns {Promise} - A promise that resolves when email is sent
 */
export const sendCityRequest = async (formData) => {
  const response = await fetch('https://formspree.io/f/movkdrwk', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      city: formData.city,
      email: formData.email,
      _subject: 'CrimeGrid.ai - New City Request',
      message: `City Request: ${formData.city} from ${formData.email}`
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return { success: true, messageId: 'formspree-' + Date.now() };
};