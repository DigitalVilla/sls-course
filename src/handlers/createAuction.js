import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import createError from 'http-errors';
import commonWare from './lib/commonWare';
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title, description } = event.body;
  const auction = {
    id: uuid(),
    title,
    description,
    status: 'OPEN',
    createAt: new Date().toISOString(),
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ data: { auction } }),
  };
}

export const handler = commonWare(createAuction);
