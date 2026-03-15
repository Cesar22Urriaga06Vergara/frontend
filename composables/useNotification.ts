// composables/useNotification.ts
import { nextTick, reactive } from 'vue'

interface NotificationState {
  show: boolean
  message: string
  color: string
  timeout: number
}

const state = reactive<NotificationState>({
  show: false,
  message: '',
  color: 'success',
  timeout: 4000,
})

export const useNotification = () => {
  const notify = (message: string, color: string = 'success', timeout: number = 4000) => {
    state.show = false
    nextTick(() => {
      state.message = message
      state.color = color
      state.timeout = timeout
      state.show = true
    })
  }

  const success = (message: string) => notify(message, 'success')
  const error = (message: string) => notify(message, 'error', 5000)
  const warning = (message: string) => notify(message, 'warning')
  const info = (message: string) => notify(message, 'info')

  return {
    state,
    notify,
    success,
    error,
    warning,
    info,
  }
}
