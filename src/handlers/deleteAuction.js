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
  let auction = null;

  try {
    const response = await dynamodb
      .delete({ TableName: TABLE, Key: { id }, ReturnValues: 'ALL_OLD' })
      .promise();
    auction = response.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError({ error });
  }

  if (!auction.title) {
    throw new createError.NotFound({ error: 'Auction not found' });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        message: `Auction: "${auction.title}" was successfully deleted`,
      },
    }),
  };
}

export const handler = middy(deleteAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
