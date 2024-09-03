import { ArticleDao } from '@repo/dao/dist/src/dao/article.dao'
import { Article } from '@repo/dao/dist/src/interfaces/article'
import { BLOG_PAGE_SIZE } from '../constants'

export interface ArticleService {
  latestArticle(): Promise<Article | undefined>
  articles(timestamp?: number | undefined): Promise<Article[]>
}

export class ArticleServiceImpl implements ArticleService {
  public constructor(
    private articleDao: ArticleDao
  ) { }

  public async latestArticle(): Promise<Article | undefined> {
    return await this.articleDao.loadLatestArticle()
  }

  public async articles(timestamp?: number | undefined): Promise<Article[]> {
    return await this.articleDao.loadArticles(BLOG_PAGE_SIZE, timestamp)
  }
}
