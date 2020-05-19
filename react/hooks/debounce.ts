import { useState, useCallback } from "react"
import { debounce } from "lodash"

/**
 * @util
 * Just like `useState`, with setState debounced
 */
export function useDebouncedState<T>(initial: T, wait = 300) {
  const [state, setState] = useState<T>(initial)
  const debouncedSetState = useCallback(
    (val: T) => debounce(setState, wait)(val),
    [setState, wait],
  )
  return [state, debouncedSetState, setState] as const
}
