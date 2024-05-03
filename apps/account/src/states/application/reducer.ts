import { createSlice, nanoid } from '@reduxjs/toolkit'
import { ApplicationState } from '../../types/application-state'
import { ApplicationPage } from '../../types/page'

const initialState: ApplicationState = {
  currentPage: ApplicationPage.HOME,
  openModal: undefined,
  infoMessages: []
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setCurrentPage(state, action) {
      state.currentPage = action.payload
    },
    setOpenModal(state, action) {
      state.openModal = action.payload
    },
    addInfoMessage(
      state,
      { payload: { content, key, variant, error } }: { payload: { content: string; key?: string; variant?: string, error?: unknown } }
    ) {
      state.infoMessages = (key ? state.infoMessages.filter(item => item.key !== key) : state.infoMessages).concat([
        {
          key: key || nanoid(),
          variant,
          content,
          error
        },
      ])
    },
    removeInfoMessage(state, { payload: { key } }) {
      state.infoMessages = state.infoMessages.filter(item => item.key !== key)
    },
    clearInfoMessage(state) {
      state.infoMessages = []
    }
  }
})

export const { setCurrentPage, setOpenModal, addInfoMessage, removeInfoMessage, clearInfoMessage } = applicationSlice.actions
export default applicationSlice.reducer
