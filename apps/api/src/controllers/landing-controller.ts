import { NextFunction, Request, Response } from 'express'

import { processControllerError, tryParseInt } from '../utils/utils'
import { ArticleService } from '../services/article-service'

export class LandingController {
  public constructor(
    private articleService: ArticleService
  ) { }

  public async latestArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.articleService.latestArticle()
      res.send(data)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }

  public async articles(req: Request, res: Response, next: NextFunction) {
    try {
      const timestamp = tryParseInt(req.params.timestamp)
      const data = await this.articleService.articles(timestamp)
      res.send(data)
    } catch (err) {
      processControllerError(res, err as Error)
    }
  }
}
