import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonWare from './lib/commonWare';
import { getAuctionById } from './getAuction';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount, currency } = event.body;
  let auction = await getAuctionById(id);

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: `set highestBid.amount = :amount ${
      currency ? ', highestBid.currency = :currency' : ''
    }`,
    ExpressionAttributeValues: {
      ':amount': amount,
      ':currency': currency,
    },
  };

  try {
    const result = await dynamodb.update(params).promise();
    auction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: { auction },
    }),
  };
}

export const handler = commonWare(placeBid);
