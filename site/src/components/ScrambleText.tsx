import { useState, useEffect, useCallback } from 'react'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'

export function ScrambleText({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const [display, setDisplay] = useState(text)
  const [hasAnimated, setHasAnimated] = useState(false)

  const scramble = useCallback(() => {
    const chars = text.split('')
    const iterations = 6
    let frame = 0
    const totalFrames = chars.length * iterations

    const interval = setInterval(() => {
      setDisplay(
        chars
          .map((char, i) => {
            if (char === ' ') return ' '
            if (frame / iterations > i) return char
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          })
          .join('')
      )
      frame++
      if (frame > totalFrames) {
        clearInterval(interval)
        setDisplay(text)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [text])

  useEffect(() => {
    const timeout = setTimeout(() => {
      scramble()
      setHasAnimated(true)
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [delay, scramble])

  return (
    <span className={className} onMouseEnter={hasAnimated ? scramble : undefined}>
      {display}
    </span>
  )
}
