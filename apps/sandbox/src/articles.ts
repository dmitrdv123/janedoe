import * as dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}`.trim() })

import * as fs from 'fs'
import path from 'path'

import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { Article } from '@repo/dao/dist/src/interfaces/article'
import { DynamoServiceImpl } from '@repo/dao-aws/dist/src/services/dynamo.service'
import { ArticleDaoImpl } from '@repo/dao-aws/dist/src/dao/article.dao'

import { loadFile } from './utils'
import { createAppConfig } from './app-config'

createAppConfig()

const dynamoService = new DynamoServiceImpl(new DynamoDB())
const articleDao = new ArticleDaoImpl(dynamoService)

async function main() {
  const articlesFolder = 'data/articles'

  console.log(`Start to delete articles`)
  await articleDao.deleteArticles()

  console.log(`Start to save articles`)
  await Promise.all(
    fs.readdirSync(path.join(process.cwd(), articlesFolder))
      .filter(file => file.toLocaleLowerCase().endsWith('.json'))
      .map(
        async file => {
          const filePath = `${articlesFolder}/${file}`
          const article = await loadFile<Article>(filePath)
          if (!article) {
            throw new Error(`Cannot find file ${filePath}`)
          }

          console.log(`Start to save article ${file}`)
          await articleDao.saveArticle(article)
        }
      )
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
