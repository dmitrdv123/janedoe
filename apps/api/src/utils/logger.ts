import { pino } from 'pino'

export const logger = pino(JSON.parse(process.env.PINO_CONFIG as string))
