import { S3 } from '@aws-sdk/client-s3'
import appConfig from '@repo/common/dist/src/app-config'

export interface S3Service {
  loadFile(file: string): Promise<string | undefined>
  saveFile(file: string, content: string): Promise<void>
}

export class S3ServiceImpl implements S3Service {
  public constructor(
    private s3: S3
  ) { }

  public async loadFile(file: string): Promise<string | undefined> {
    const data = await this.s3.getObject({
      Bucket: appConfig.BUCKET_NAME_DATA,
      Key: file
    })
    return data.Body?.transformToString()
  }

  public async saveFile(file: string, content: string): Promise<void> {
    await this.s3.putObject({
      Bucket: appConfig.BUCKET_NAME_DATA,
      Key: file,
      Body: content
    })
  }
}