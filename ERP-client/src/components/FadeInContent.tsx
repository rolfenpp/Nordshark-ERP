import { Box, Fade } from '@mui/material'
import { useState, useEffect } from 'react'

interface FadeInContentProps {
  children: React.ReactNode
  delay?: number
  duration?: number
}

export function FadeInContent({ children, delay = 100, duration = 600 }: FadeInContentProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Fade in={show} timeout={duration} easing="ease-out">
      <Box
        sx={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        }}
      >
        {children}
      </Box>
    </Fade>
  )
}
