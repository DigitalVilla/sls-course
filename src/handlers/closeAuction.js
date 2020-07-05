import AWS from 'aws-sdk';
import createError from 'http-errors';
import { getEndedAuctions } from './lib/getEndedAuctions';
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function closeAuction(event, context) {
  try {
    const auctions = await getEndedAuctions();
    const closePromises = auctions.map((el) => updateState(el.id));
    await Promise.all(closePromises);
    return { closed: closePromises.length };
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

async function updateState(id) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamodb.update(params).promise();
  return result;
}

export const handler = closeAuction;
