import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonWare from './lib/commonWare';
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let results = null;

  try {
    results = await dynamodb
      .scan({ TableName: process.env.AUCTIONS_TABLE_NAME })
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

export const handler = commonWare(getAuctions);
