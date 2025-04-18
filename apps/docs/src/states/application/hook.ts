import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '../../libs/hooks/useAppDispatch'
import { addInfoMessage, clearInfoMessage, removeInfoMessage, setCurrentPage } from './reducer'
import { AppState } from '../store'
import { ApplicationPage } from '../../types/page'

export function useCurrentPage() {
  const dispatch = useAppDispatch()

  return {
    currentPage: useAppSelector((state: AppState) => state.application.currentPage),
    setCurrentPage: useCallback((page: ApplicationPage) => dispatch(setCurrentPage(page)), [dispatch])
  }
}

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
