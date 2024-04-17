import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '../../libs/hooks/useAppDispatch'
import { addInfoMessage, removeInfoMessage, clearInfoMessage } from './reducer'
import { AppState } from '../store'

export function useInfoMessages() {
  const dispatch = useAppDispatch()

  return {
    infoMessages: useAppSelector((state: AppState) => state.application.infoMessages),
    addInfoMessage: useCallback(
      (content: string, key?: string | undefined, variant?: string | undefined) => {
        dispatch(addInfoMessage({ content, key, variant }))
      },
      [dispatch]
    ),
    removeInfoMessage: useCallback(
      (key: string) => {
        dispatch(removeInfoMessage({ key }))
      },
      [dispatch]
    ),
    clearInfoMessage: useCallback(
      () => {
        dispatch(clearInfoMessage())
      },
      [dispatch]
    )
  }
}
