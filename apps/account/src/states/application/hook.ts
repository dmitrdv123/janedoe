import { useCallback } from 'react'

import { ApplicationModal } from '../../types/application-modal'
import { useAppDispatch, useAppSelector } from '../../libs/hooks/useAppDispatch'
import { addInfoMessage, removeInfoMessage, clearInfoMessage, setOpenModal, setCurrentPage } from './reducer'
import { AppState } from '../store'
import { ApplicationPage } from '../../types/page'
import { serializeErrorForRedux } from '../../libs/utils'

export function useCurrentPage() {
  const dispatch = useAppDispatch()

  return {
    currentPage: useAppSelector((state: AppState) => state.application.currentPage),
    setCurrentPage: useCallback((page: ApplicationPage) => dispatch(setCurrentPage(page)), [dispatch])
  }
}

export function useModalIsOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const isOpen = useModalIsOpen(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(isOpen ? null : modal)), [dispatch, modal, isOpen])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModal(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useInfoMessages() {
  const dispatch = useAppDispatch()

  return {
    infoMessages: useAppSelector((state: AppState) => state.application.infoMessages),
    addInfoMessage: useCallback(
      (content: string, key?: string, variant?: string, error?: unknown) => {
        dispatch(addInfoMessage({ content, key, variant, error: error ? serializeErrorForRedux(error) : error }))
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
