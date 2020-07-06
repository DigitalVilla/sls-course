import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';
import commonWare from './lib/commonWare';
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let results = null;

  try {
    results = await dynamodb
      .query({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusClosedDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
          ':status': status,
        },
        ExpressionAttributeNames: {
          '#status': 'status',
        },
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: { auctions: results.Items, size: results.Count },
    }),
  };
}

export const handler = commonWare(getAuctions).use(
  validator({
    inputSchema: {
      properties: {
        queryStringParameters: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['OPEN', 'CLOSED'],
              default: 'OPEN',
            },
          },
        },
      },
      required: ['queryStringParameters'],
    },
    useDefaults: true,
  })
);
