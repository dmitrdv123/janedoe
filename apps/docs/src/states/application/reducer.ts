import { createSlice, nanoid } from '@reduxjs/toolkit'
import { ApplicationState } from '../../types/application-state'

const initialState: ApplicationState = {
  infoMessages: []
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
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

export const { addInfoMessage, removeInfoMessage, clearInfoMessage } = applicationSlice.actions
export default applicationSlice.reducer
