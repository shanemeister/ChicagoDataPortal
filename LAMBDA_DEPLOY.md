# Deploy City Request Lambda Function

## Steps to Deploy:

### 1. Create Lambda Function
```bash
cd lambda
zip -r city-request-handler.zip city-request-handler.js
aws lambda create-function \
  --function-name crimegrid-city-request \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-ses-execution-role \
  --handler city-request-handler.handler \
  --zip-file fileb://city-request-handler.zip
```

### 2. Create IAM Role for Lambda
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### 3. Attach SES Policy to Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
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

### 4. Create API Gateway
1. Create new REST API
2. Create resource `/city-request`
3. Create POST method
4. Point to Lambda function
5. Enable CORS
6. Deploy to stage (e.g., `prod`)

### 5. Update Frontend
Replace the API endpoint in `email-service.js`:
```javascript
const response = await fetch('https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/city-request', {
```

### 6. Test
- Deploy Lambda and API Gateway
- Update frontend with real endpoint
- Test form submission
- Check SES for email delivery