import { useCallback, useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Col, Row, Spinner } from 'react-bootstrap'

import { Article } from '../../types/article'
import useArticles from '../../libs/hooks/useArticles'

const Blogs: React.FC = () => {
  const [articlesData, setArticlesData] = useState<Article[] | undefined>(undefined)

  const observer = useRef<IntersectionObserver>()

  const { t } = useTranslation()

  const {
    data: articles,
    status: articlesStatus,
    loadNext: loadNextPaymentHistory,
  } = useArticles()

  const lastPaymentElementRef = useCallback((node: Element | null) => {
    if (observer.current) {
      observer.current.disconnect()
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadNextPaymentHistory()
      }
    })

    if (node) {
      observer.current?.observe(node)
    }
  }, [loadNextPaymentHistory])

  useEffect(() => {
    setArticlesData(articles)
  }, [articles])

  const getArticle = useCallback((article: Article, last: boolean) => {
    return (
      <div
        key={`article_${article.timestamp}`}
        ref={last ? lastPaymentElementRef : null}
      >
        <Row className="featurette">
          <Col>
            <h2 className="featurette-heading fw-normal lh-1">
              {article.title}
              <small className="text-body-secondary ms-3">
                ({new Date(1000 * article.timestamp).toLocaleDateString()})
              </small>
            </h2>

            <div dangerouslySetInnerHTML={{ __html: article.content }} />

            {!!article.link && (
              <p className="lead">
                <a target="_blank" href={article.link}>
                  {t('pages.blog.read_more')}
                </a>
              </p>
            )}
          </Col>
        </Row>

        <hr className="featurette-divider" />
      </div>
    )
  }, [lastPaymentElementRef, t])

  return (
    <div className="container marketing">
      {(articlesStatus === 'error') && (
        <>
          <Row className="featurette">
            <Col>
              <h2 className="featurette-heading fw-normal lh-1">
                {t('pages.blog.errors.load_error')}
              </h2>
            </Col>
          </Row>

          <hr className="featurette-divider" />
        </>
      )}
      {(articlesStatus === 'processing') && (
        <>
          <Row className="featurette">
            <Col>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true">
                <span className="visually-hidden">{t('common.loading')}</span>
              </Spinner>
            </Col>
          </Row>

          <hr className="featurette-divider" />
        </>
      )}
      {(!!articlesData && articlesData.length === 0) && (
        <>
          <Row className="featurette">
            <Col>
              <h2 className="featurette-heading fw-normal lh-1">
                {t('pages.blog.no_blogs')}
              </h2>
            </Col>
          </Row>

          <hr className="featurette-divider" />
        </>
      )}
      {(!!articlesData && articlesData.length > 0) && (
        articlesData.map((item, i) => getArticle(item, i === articlesData.length - 1))
      )}
    </div>
  )
}

export default Blogs
