import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonWare from './lib/commonWare';
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function deleteAuction(event, context) {
  const { id } = event.pathParameters;
  let auction = null;

  try {
    const response = await dynamodb
      .delete({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        ReturnValues: 'ALL_OLD',
      })
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

export const handler = commonWare(deleteAuction);
