import { Article } from '../interfaces/article'

export interface ArticleDao {
  saveArticle(article: Article): Promise<void>
  loadArticles(pageSize: number, timestamp?: number | undefined): Promise<Article[]>
  loadLatestArticle(): Promise<Article | undefined>
  deleteArticles(): Promise<void>
}
