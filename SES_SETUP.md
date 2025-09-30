# SES Setup for CrimeGrid.ai City Requests

## Steps to Deploy:

### 1. Deploy Lambda Function
```bash
cd lambda
zip -r city-request.zip city-request.js
aws lambda create-function \
  --function-name crimegrid-city-request \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-ses-role \
  --handler city-request.handler \
  --zip-file fileb://city-request.zip
```

### 2. Create API Gateway
- Create new REST API
- Create resource `/city-request`
- Create POST method
- Point to Lambda function
- Enable CORS for `https://crimegrid.ai`

### 3. Update Frontend
Replace `YOUR_LAMBDA_URL` in LandingPage.jsx with your API Gateway URL

### 4. SES Configuration
Ensure these are verified in SES:
- Domain: `relufox.ai`
- Email: `info@relufox.ai`

### 5. IAM Role
Lambda needs SES permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```