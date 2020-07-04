import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.AUCTIONS_TABLE_NAME;

async function deleteAuction(event, context) {
  const { id } = event.pathParameters;

  try {
    await dynamodb.delete({ TableName: TABLE, Key: { id } }).promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        deletedId: id,
        message: 'Auction successfully deleted',
      },
    }),
  };
}

export const handler = middy(deleteAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
