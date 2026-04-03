import { computed, type ComputedRef, type Ref } from 'vue'

export type ViewStatus = 'loading' | 'error' | 'empty' | 'success' | 'unavailable'

interface ResolveViewStatusOptions {
  loading: boolean
  hasData: boolean
  errorMessage?: string | null
  unavailable?: boolean
}

export const resolveViewStatus = (options: ResolveViewStatusOptions): ViewStatus => {
  if (options.loading) return 'loading'
  if (options.unavailable) return 'unavailable'
  if (options.errorMessage) return 'error'
  return options.hasData ? 'success' : 'empty'
}

export const useViewState = (
  loading: Ref<boolean> | ComputedRef<boolean>,
  hasData: Ref<boolean> | ComputedRef<boolean>,
  errorMessage?: Ref<string | null> | ComputedRef<string | null>,
  unavailable?: Ref<boolean> | ComputedRef<boolean>,
) => {
  const status = computed<ViewStatus>(() =>
    resolveViewStatus({
      loading: loading.value,
      hasData: hasData.value,
      errorMessage: errorMessage?.value || null,
      unavailable: unavailable?.value || false,
    }),
  )

  return {
    status,
    isLoading: computed(() => status.value === 'loading'),
    isError: computed(() => status.value === 'error'),
    isEmpty: computed(() => status.value === 'empty'),
    isSuccess: computed(() => status.value === 'success'),
    isUnavailable: computed(() => status.value === 'unavailable'),
  }
}
