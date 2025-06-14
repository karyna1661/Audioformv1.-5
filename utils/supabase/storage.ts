import { supabase } from "@/lib/supabase/client"

/**
 * Uploads an audio file to the Supabase storage
 * @param file The audio file to upload
 * @param path The path within the bucket (e.g., 'surveys/123/audio.webm')
 * @returns The public URL of the uploaded file
 */
export async function uploadAudio(file: File, path: string): Promise<string> {
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
  const { data, error } = await supabase.storage.from("demo-audio").list(directory)

  if (error) {
    console.error("Error listing audio files:", error)
    throw error
  }

  return data
}

// Additional storage utilities
export const uploadFile = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage.from("demo-audio").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })
    if (error) {
      console.error("Error uploading file:", error)
      return { data: null, error: error.message }
    }
    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error uploading file:", error)
    return { data: null, error: error.message }
  }
}

export const getFileUrl = async (path: string) => {
  try {
    const { data } = supabase.storage.from("demo-audio").getPublicUrl(path)
    return data.publicUrl
  } catch (error: any) {
    console.error("Error getting public url:", error)
    return null
  }
}

export const deleteFile = async (path: string) => {
  try {
    const { error } = await supabase.storage.from("demo-audio").remove([path])

    if (error) {
      console.error("Error deleting file:", error)
      return { error: error.message }
    }
    return { error: null }
  } catch (error: any) {
    console.error("Unexpected error deleting file:", error)
    return { error: error.message }
  }
}
