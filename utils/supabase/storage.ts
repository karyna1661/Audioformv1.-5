import { createClient } from "./client"

/**
 * Uploads an audio file to the Supabase storage
 * @param file The audio file to upload
 * @param path The path within the bucket (e.g., 'surveys/123/audio.webm')
 * @returns The public URL of the uploaded file
 */
export async function uploadAudio(file: File, path: string): Promise<string> {
  const supabase = createClient()

  // Upload the file to the demo-audio bucket (ensure correct bucket name)
  const { data, error } = await supabase.storage.from("demo-audio").upload(path, file, {
    cacheControl: "3600",
    upsert: true, // Allow overwriting existing files
  })

  if (error) {
    console.error("Error uploading audio:", error)
    throw error
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage.from("demo-audio").getPublicUrl(path)

  return publicUrlData.publicUrl
}

/**
 * Deletes an audio file from Supabase storage
 * @param path The path of the file to delete
 */
export async function deleteAudio(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from("demo-audio").remove([path])

  if (error) {
    console.error("Error deleting audio:", error)
    throw error
  }
}

/**
 * Lists all files in a directory
 * @param directory The directory path to list
 * @returns Array of file objects
 */
export async function listAudioFiles(directory: string) {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from("demo-audio").list(directory)

  if (error) {
    console.error("Error listing audio files:", error)
    throw error
  }

  return data
}
