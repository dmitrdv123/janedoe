import { BatchWriteItemInput, CreateTableInput, CreateTableOutput, DeleteItemInput, DeleteItemOutput, DeleteTableInput, DeleteTableOutput, DescribeTableInput, DescribeTableOutput, DynamoDB, GetItemInput, GetItemOutput, PutItemInput, PutItemOutput, QueryInput, QueryOutput, ScanInput, ScanOutput, TableDescription, UpdateItemInput, UpdateItemOutput, UpdateTimeToLiveCommandInput, UpdateTimeToLiveCommandOutput } from '@aws-sdk/client-dynamodb'

export interface DynamoService {
  describeTable(tableName: string): Promise<DescribeTableOutput>
  createTable(request: CreateTableInput): Promise<CreateTableOutput>
  deleteTable(tableName: string): Promise<DeleteTableOutput>
  readItem(request: GetItemInput): Promise<GetItemOutput>
  putItem(request: PutItemInput): Promise<PutItemOutput>
  updateItem(request: UpdateItemInput): Promise<UpdateItemOutput>
  deleteItem(request: DeleteItemInput): Promise<DeleteItemOutput>
  batchWriteItems(request: BatchWriteItemInput): Promise<void>
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

  public async queryItems(request: QueryInput): Promise<QueryOutput> {
    const result = await this.dynamodb.query(request)

    while (result.LastEvaluatedKey != null) {
      request.ExclusiveStartKey = result.LastEvaluatedKey
      const nextResult = await this.dynamodb.query(request)
      const nextItems = nextResult.Items ?? []
      const resultItems = result.Items ?? []
      nextItems.forEach(item => resultItems.push(item))
      result.Count = (result.Count ?? 0) + (nextResult.Count ?? 0)
      result.ScannedCount = (result.ScannedCount ?? 0) + (nextResult.ScannedCount ?? 0)
      result.LastEvaluatedKey = nextResult.LastEvaluatedKey
    }

    return result
  }

  public async scanItems(request: ScanInput): Promise<ScanOutput> {
    const result = await this.dynamodb.scan(request)

    while (result.LastEvaluatedKey != null) {
      request.ExclusiveStartKey = result.LastEvaluatedKey
      const nextResult = await this.dynamodb.scan(request)
      const nextItems = nextResult.Items ?? []
      const resultItems = result.Items ?? []
      nextItems.forEach(item => resultItems.push(item))
      result.Count = (result.Count ?? 0) + (nextResult.Count ?? 0)
      result.ScannedCount = (result.ScannedCount ?? 0) + (nextResult.ScannedCount ?? 0)
      result.LastEvaluatedKey = nextResult.LastEvaluatedKey
    }

    return result
  }

}