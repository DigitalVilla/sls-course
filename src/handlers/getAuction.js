import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.AUCTIONS_TABLE_NAME;

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  let auction = null;

  try {
    const result = await dynamodb
      .get({ TableName: TABLE, Key: { id } })
      .promise();

    auction = result.Item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound('Auction not found');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: { auction },
    }),
  };
}

export const handler = middy(getAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
