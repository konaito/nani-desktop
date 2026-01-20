import { useEffect, useState, useRef } from 'react'

interface MotionLazyLoadProps {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
  disabled?: boolean
}

export function MotionLazyLoad({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  disabled = false
}: MotionLazyLoadProps) {
  const [isVisible, setIsVisible] = useState(disabled)
  const [reduceMotion, setReduceMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reduce Motion設定をチェック
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    if (disabled || reduceMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    const currentElement = containerRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
      observer.disconnect()
    }
  }, [threshold, rootMargin, disabled, reduceMotion])

  return (
    <div
      ref={containerRef}
      className={`motion-lazyload ${isVisible ? 'motion-lazyload-visible' : ''}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: reduceMotion ? 'none' : 'opacity 0.6s ease-out, transform 0.6s ease-out'
      }}
    >
      {children}
    </div>
  )
}

interface MotionFadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
}

export function MotionFadeIn({ children, delay = 0, duration = 0.4 }: MotionFadeInProps) {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)
    setVisible(true)

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div
      className="motion-fadein"
      style={{
        opacity: visible ? 1 : 0,
        transition: reduceMotion ? 'none' : `opacity ${duration}s ease-in ${delay}s`
      }}
    >
      {children}
    </div>
  )
}

interface MotionSlideUpProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  distance?: number
}

export function MotionSlideUp({
  children,
  delay = 0,
  duration = 0.5,
  distance = 30
}: MotionSlideUpProps) {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)
    setVisible(true)

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div
      className="motion-slideup"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: reduceMotion ? 'none' : `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`
      }}
    >
      {children}
    </div>
  )
}

interface MotionScaleInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  scale?: number
}

export function MotionScaleIn({
  children,
  delay = 0,
  duration = 0.3,
  scale = 0.9
}: MotionScaleInProps) {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)
    setVisible(true)

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div
      className="motion-scalein"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : `scale(${scale})`,
        transition: reduceMotion ? 'none' : `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`
      }}
    >
      {children}
    </div>
  )
}
