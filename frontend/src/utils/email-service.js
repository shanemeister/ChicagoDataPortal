/**
 * Email service utility for CrimeGrid city requests
 */
import { fetchAuthSession } from 'aws-amplify/auth';
import AWS from 'aws-sdk';

/**
 * Sends city request via AWS SES
 * 
 * @param {Object} formData - The form data to send
 * @returns {Promise} - A promise that resolves when the email is sent
 */
export const sendCityRequest = async (formData) => {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;
    
    AWS.config.update({
      region: 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });
    
    const emailBody = `
New City Request from CrimeGrid.ai

REQUESTED CITY: ${formData.city}
CONTACT EMAIL: ${formData.email}

Submitted via: https://crimegrid.ai
Timestamp: ${new Date().toISOString()}
`;
    
    const ses = new AWS.SES();
    const emailParams = {
      Source: 'info@relufox.ai',
      Destination: {
        ToAddresses: ['info@relufox.ai']
      },
      Message: {
        Subject: {
          Data: 'CrimeGrid.ai - New City Request'
        },
        Body: {
          Text: {
            Data: emailBody
          }
        }
      }
    };
    
    const result = await ses.sendEmail(emailParams).promise();
    return { success: true, messageId: result.MessageId };
    
  } catch (error) {
    console.error('Error sending city request:', error);
    throw error;
  }
};