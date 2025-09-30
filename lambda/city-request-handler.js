const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({ region: 'us-east-1' });

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        const { city, email } = JSON.parse(event.body);
        
        const emailBody = `
New City Request from CrimeGrid.ai

REQUESTED CITY: ${city}
CONTACT EMAIL: ${email}

Submitted via: https://crimegrid.ai
Timestamp: ${new Date().toISOString()}
        `;
        
        const command = new SendEmailCommand({
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
        });

        const result = await sesClient.send(command);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                messageId: result.MessageId 
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message 
            })
        };
    }
};