import { ApplicationModal } from './application-modal'
import { InfoMessage } from './info-message'

export interface ApplicationState {
  readonly openModal?: ApplicationModal | undefined
  readonly infoMessages: InfoMessage[]
}
