import { Container } from '@repo/common/dist/src/containers/container'

import { EvmServiceImpl } from '../services/evm-service'

export const evmContainer = new Container()

// Services
evmContainer.register('evmService', new EvmServiceImpl())
