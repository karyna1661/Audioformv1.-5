"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function RespondPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase.from("responses").select("*").eq("id", id).single()

        if (error) {
          setError(error)
        } else {
          setData(data)
        }
      } catch (error: any) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!data) {
    return <div>No data found for ID: {id}</div>
  }

  return (
    <div>
      <h1>Response ID: {id}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
