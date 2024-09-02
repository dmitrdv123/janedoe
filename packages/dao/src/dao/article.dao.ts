import { Article } from '../interfaces/article'

export interface ArticleDao {
  saveArticle(article: Article): Promise<void>
  loadArticles(pageSize: number, latestArticle?: Article | undefined): Promise<Article[]>
  loadLatestArticle(): Promise<Article | undefined>
}
