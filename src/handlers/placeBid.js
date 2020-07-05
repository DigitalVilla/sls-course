import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonWare from './lib/commonWare';
import { getAuctionById } from './getAuction';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount, bidder } = event.body;
  let auction = await getAuctionById(id);
  const nextBid = auction.highestBid.amount + auction.raise;

  if (amount <= nextBid) {
    throw new createError.Forbidden(`Your bid must be higher than $${nextBid}`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    ReturnValues: 'ALL_NEW',
    UpdateExpression:
      'set highestBid.amount = :amount, highestBid.bidder = :bidder, bids = :bids',
    ExpressionAttributeValues: {
      ':bids': auction.bids + 1,
      ':amount': amount,
      ':bidder': bidder,
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
