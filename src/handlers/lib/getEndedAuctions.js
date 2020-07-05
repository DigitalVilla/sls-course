import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusClosedDate',
    KeyConditionExpression: '#status = :status AND closedAt <= :now',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': new Date().toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamodb.query(params).promise();
  return result.Items;
}
