import { useEffect, useState } from "react"

export interface UseSetIntervalProps {
  interval: number
  callback: () => void
  flag: boolean
}


/**
 * @util 用于设置和自动清理 setInterval
 */
export const useSetInterval = ({
  interval,
  callback,
  flag,
}: UseSetIntervalProps) => {
  useEffect(() => {
    if (flag) {
      const t = setInterval(callback, interval)
      return () => {
        clearInterval(t)
      }
    }
    return undefined
  }, [interval, callback, flag])
}

/**
 * @util 用于管理倒计时
 * NOTE: 不要在倒计时中途修改 seconds，会导致行为不符合预期
 * @param seconds - 倒计时秒数
 * @param accuracy - 毫秒数，用于指定倒计时更新时间间隔，影响计时精度，默认 200ms
 * @return [left, started, setStarted] - left 剩余秒数， started 倒计时是否已开始(默认 false)， setStarted 用于修改倒计时状态
 */
export const useCountDown = ({
  seconds,
  accuracy = 200,
}: {
  seconds: number
  accuracy?: number
}) => {
  const [started, setStarted] = useState(false)
  const [startAt, setStartAt] = useState<number | undefined>()
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    if (started) {
      setStartAt(Date.now())
      setLeft(seconds)
    } else {
      setStartAt(undefined)
    }
  }, [seconds, started])

  const callback = () => {
    if (started && startAt) {
      const now = Date.now()
      const l = Math.max(0, Math.round(seconds - (now - startAt) / 1000))
      setLeft(l)
      setStarted(!!l)
    }
  }

  useSetInterval({
    interval: accuracy,
    callback,
    flag: !!startAt,
  })

  return [left, started, setStarted] as const
}
