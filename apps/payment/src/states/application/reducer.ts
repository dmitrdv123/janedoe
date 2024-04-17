import { createSlice, nanoid } from '@reduxjs/toolkit'
import { ApplicationState } from '../../types/application-state'

const initialState: ApplicationState = {
  openModal: undefined,
  infoMessages: []
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
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

export const { setOpenModal, addInfoMessage, removeInfoMessage, clearInfoMessage } = applicationSlice.actions
export default applicationSlice.reducer
