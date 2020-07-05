import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonWare from './lib/commonWare';
const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let auction;

  try {
    const result = await dynamodb
      .get({ TableName: process.env.AUCTIONS_TABLE_NAME, Key: { id } })
      .promise();
    auction = result.Item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound('Auction not found');
  }

  return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: { auction },
    }),
  };
}

export const handler = commonWare(getAuction);
