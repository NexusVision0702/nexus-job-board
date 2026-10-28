import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.MY_AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MY_DYNAMODB_COMPANY_TABLE || 'nexus-job-board';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyId = 'comp_' + Date.now();

    const item = {
      id: companyId,
      ...body,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);

    return NextResponse.json({ success: true, companyId });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error.message || '登録処理に失敗しました。' },
      { status: 500 }
    );
  }
}