import { useEffect, useState } from 'react'

// Shows a short loading state first, like a real request would.
export function useLoading(ms = 350) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [ms])
  return loading
}
