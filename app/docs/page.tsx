'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function DocsPage() {
  const [spec, setSpec] = useState<any>(null)

  useEffect(() => {
    fetch('/api/openapi')
      .then((res) => res.json())
      .then((data) => setSpec(data))
  }, [])

  if (!spec) return <p>Loading API docs...</p>

  return <SwaggerUI spec={spec} />
}
