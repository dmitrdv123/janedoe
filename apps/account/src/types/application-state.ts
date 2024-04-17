import { ApplicationModal } from './application-modal'
import { InfoMessage } from './info-message'
import { ApplicationPage } from './page'

export interface ApplicationState {
  readonly openModal?: ApplicationModal | undefined
  readonly currentPage: ApplicationPage
  readonly infoMessages: InfoMessage[]
}
