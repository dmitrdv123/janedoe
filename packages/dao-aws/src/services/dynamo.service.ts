import { BatchGetItemCommandOutput, BatchGetItemInput, BatchWriteItemInput, CreateTableInput, CreateTableOutput, DeleteItemInput, DeleteItemOutput, DeleteTableOutput, DescribeTableOutput, DynamoDB, GetItemInput, GetItemOutput, PutItemInput, PutItemOutput, QueryInput, QueryOutput, ScanInput, ScanOutput, UpdateItemInput, UpdateItemOutput } from '@aws-sdk/client-dynamodb'

export interface DynamoService {
  describeTable(tableName: string): Promise<DescribeTableOutput>
  createTable(request: CreateTableInput): Promise<CreateTableOutput>
  deleteTable(tableName: string): Promise<DeleteTableOutput>
  readItem(request: GetItemInput): Promise<GetItemOutput>
  putItem(request: PutItemInput): Promise<PutItemOutput>
  updateItem(request: UpdateItemInput): Promise<UpdateItemOutput>
  deleteItem(request: DeleteItemInput): Promise<DeleteItemOutput>
  batchWriteItems(request: BatchWriteItemInput): Promise<void>
  batchReadItems(request: BatchGetItemInput): Promise<BatchGetItemCommandOutput>
  queryItems(request: QueryInput): Promise<QueryOutput>
  scanItems(request: ScanInput): Promise<ScanOutput>
}

export class DynamoServiceImpl implements DynamoService {
  public constructor(
    private dynamodb: DynamoDB
  ) { }

  public async describeTable(tableName: string): Promise<DescribeTableOutput> {
    return await this.dynamodb.describeTable({
      TableName: tableName
    })
  }

  public async createTable(request: CreateTableInput): Promise<CreateTableOutput> {
    return await this.dynamodb.createTable(request)
  }

  public async deleteTable(tableName: string): Promise<DeleteTableOutput> {
    return await this.dynamodb.deleteTable({
      TableName: tableName
    })
  }

  public async readItem(request: GetItemInput): Promise<GetItemOutput> {
    return await this.dynamodb.getItem(request)
  }

  public async putItem(request: PutItemInput): Promise<PutItemOutput> {
    return await this.dynamodb.putItem(request)
  }

  public async updateItem(request: UpdateItemInput): Promise<UpdateItemOutput> {
    return await this.dynamodb.updateItem(request)
  }

  public async deleteItem(request: DeleteItemInput): Promise<DeleteItemOutput> {
    return await this.dynamodb.deleteItem(request)
  }

  public async batchWriteItems(request: BatchWriteItemInput): Promise<void> {
    await this.dynamodb.batchWriteItem(request)
  }

  public async batchReadItems(request: BatchGetItemInput): Promise<BatchGetItemCommandOutput> {
    return await this.dynamodb.batchGetItem(request)
  }

  public async queryItems(request: QueryInput): Promise<QueryOutput> {
    return await this.dynamodb.query(request)
  }

  public async scanItems(request: ScanInput): Promise<ScanOutput> {
    return await this.dynamodb.scan(request)
  }
}