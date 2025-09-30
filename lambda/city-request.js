const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://crimegrid.ai',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        const { city, email } = JSON.parse(event.body);
        
        const params = {
            Destination: {
                ToAddresses: ['info@relufox.ai']
            },
            Message: {
                Body: {
                    Text: {
                        Data: `New city request from CrimeGrid.ai:

City: ${city}
Contact Email: ${email}

Submitted via: https://crimegrid.ai`
                    }
                },
                Subject: {
                    Data: 'CrimeGrid.ai - New City Request'
                }
            },
            Source: 'info@relufox.ai'
        };

        await ses.sendEmail(params).promise();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};