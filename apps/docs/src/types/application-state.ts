import { InfoMessage } from './info-message'
import { ApplicationPage } from './page'

export interface ApplicationState {
  readonly currentPage: ApplicationPage
  readonly infoMessages: InfoMessage[]
}
