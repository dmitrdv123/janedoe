import { createSlice, nanoid } from '@reduxjs/toolkit'
import { ApplicationState } from '../../types/application-state'
import { ApplicationPage } from '../../types/page'

const initialState: ApplicationState = {
  currentPage: ApplicationPage.HOME,
  infoMessages: []
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setCurrentPage(state, action) {
      state.currentPage = action.payload
    },
    addInfoMessage(
      state,
      { payload: { content, key, variant } }: { payload: { content: string; key?: string | undefined; variant?: string | undefined } }
    ) {
      state.infoMessages = (key ? state.infoMessages.filter(item => item.key !== key) : state.infoMessages).concat([
        {
          key: key || nanoid(),
          variant,
          content
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

export const { setCurrentPage, addInfoMessage, removeInfoMessage, clearInfoMessage } = applicationSlice.actions
export default applicationSlice.reducer
