"use server"

import { createClient, logDbConnection } from "@/lib/supabase/server"
import { verifyAdminCredentials, setAdminSession, clearAdminSession } from "@/lib/admin-auth"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!verifyAdminCredentials(email, password)) {
    return { error: "Credenciales inválidas" }
  }

  await setAdminSession()
  redirect("/admin/dashboard")
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect("/admin")
}

export async function uploadRingImage(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get("file") as File

  if (!file) {
    return { error: "No se proporcionó ningún archivo" }
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen" }
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "La imagen no puede superar los 5MB" }
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `rings/${fileName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage.from("ring-images").upload(filePath, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  })

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("ring-images").getPublicUrl(filePath)

  return { success: true, url: publicUrl }
}

export async function deleteRingImage(imageUrl: string) {
  const supabase = await createClient()

  // Extract file path from URL
  const url = new URL(imageUrl)
  const filePath = url.pathname.split("/ring-images/")[1]

  if (!filePath) {
    return { error: "URL de imagen inválida" }
  }

  const { error } = await supabase.storage.from("ring-images").remove([filePath])

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function createRing(formData: FormData) {
  const supabase = await createClient()

  const ring = {
    code: formData.get("code") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number.parseFloat(formData.get("price") as string),
    metal_type: formData.get("metal_type") as string,
    metal_karat: formData.get("metal_karat") as string,
    metal_color: formData.get("metal_color") as string,
    diamond_points: Number.parseFloat(formData.get("diamond_points") as string),
    diamond_color: formData.get("diamond_color") as string,
    diamond_clarity: formData.get("diamond_clarity") as string,
    image_url: formData.get("image_url") as string,
    featured: formData.get("featured") === "true",
    is_active: formData.get("is_active") === "true",
    slug: (formData.get("code") as string).toLowerCase().replace(/\s+/g, "-"),
    order_index: Number.parseInt(formData.get("order_index") as string) || 0,
  }

  const { data, error } = await supabase.from("rings").insert([ring]).select().single()

  if (error) {
    return { error: error.message }
  }

  revalidateTag("rings")
  revalidatePath("/admin/dashboard")
  revalidatePath("/catalogo")
  return { success: true, ring: data }
}

export async function updateRing(id: string, formData: FormData) {
  const supabase = await createClient()

  const ring = {
    code: formData.get("code") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number.parseFloat(formData.get("price") as string),
    metal_type: formData.get("metal_type") as string,
    metal_karat: formData.get("metal_karat") as string,
    metal_color: formData.get("metal_color") as string,
    diamond_points: Number.parseFloat(formData.get("diamond_points") as string),
    diamond_color: formData.get("diamond_color") as string,
    diamond_clarity: formData.get("diamond_clarity") as string,
    image_url: formData.get("image_url") as string,
    featured: formData.get("featured") === "true",
    is_active: formData.get("is_active") === "true",
    slug: (formData.get("code") as string).toLowerCase().replace(/\s+/g, "-"),
  }

  const { data, error } = await supabase.from("rings").update(ring).eq("id", id).select().single()

  if (error) {
    return { error: error.message }
  }

  revalidateTag("rings")
  revalidatePath("/admin/dashboard")
  revalidatePath("/catalogo")
  if (ring?.slug) {
    revalidatePath(`/catalogo/${ring.slug}`)
  }
  return { success: true, ring: data }
}

export async function deleteRing(id: string) {
  const correlationId = logDbConnection("DELETE_RING")
  const supabase = await createClient()

  console.log(`[v0] [${correlationId}] DELETE_RING: Starting deletion for ID:`, id)

  // Step 1: Verify the ring exists and get its details
  const { data: ring, error: fetchError } = await supabase
    .from("rings")
    .select("id, slug, code, name")
    .eq("id", id)
    .single()

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      // Not found - 404
      console.log(`[v0] [${correlationId}] DELETE_RING: Ring not found (already deleted)`)
      return { error: "NOT_FOUND", message: "Este anillo ya no existe" }
    }
    console.error(`[v0] [${correlationId}] DELETE_RING: Error fetching ring:`, fetchError)
    return { error: "FETCH_ERROR", message: "Error al buscar el anillo" }
  }

  if (!ring) {
    console.log(`[v0] [${correlationId}] DELETE_RING: Ring not found (null result)`)
    return { error: "NOT_FOUND", message: "Este anillo ya no existe" }
  }

  console.log(`[v0] [${correlationId}] DELETE_RING: Ring found:`, {
    id: ring.id,
    code: ring.code,
    name: ring.name,
    slug: ring.slug,
  })

  // Step 2: Perform the delete operation using RPC for proper transaction
  // We'll use a direct delete and check the count
  const { error: deleteError, count } = await supabase.from("rings").delete({ count: "exact" }).eq("id", id)

  if (deleteError) {
    console.error(`[v0] [${correlationId}] DELETE_RING: Delete operation failed:`, deleteError)

    // Check if it's a foreign key constraint error
    if (deleteError.code === "23503") {
      return {
        error: "CONSTRAINT",
        message: "No se pudo eliminar porque está relacionado con otros datos.",
      }
    }

    return { error: "DELETE_ERROR", message: `Error al eliminar: ${deleteError.message}` }
  }

  console.log(`[v0] [${correlationId}] DELETE_RING: Delete executed, affected rows:`, count)

  // Step 3: Check affected rows count
  if (count === 0) {
    console.warn(`[v0] [${correlationId}] DELETE_RING: No rows were deleted (count = 0)`)
    return { error: "NOT_FOUND", message: "Este anillo ya no existe" }
  }

  if (count !== 1) {
    console.error(`[v0] [${correlationId}] DELETE_RING: Unexpected row count:`, count)
  }

  // Step 4: Verify the ring is gone (use a fresh query with no caching)
  const { data: verifyRing, error: verifyError } = await supabase
    .from("rings")
    .select("id", { count: "exact" })
    .eq("id", id)
    .maybeSingle()

  if (verifyError) {
    console.error(`[v0] [${correlationId}] DELETE_RING: Verification query error:`, verifyError)
    // Don't fail the whole operation if verification fails
  } else if (verifyRing) {
    // This is the critical error - ring still exists after delete!
    console.error(`[v0] [${correlationId}] DELETE_RING: CRITICAL - Ring still exists after delete!`, {
      id: verifyRing.id,
      timestamp: new Date().toISOString(),
    })
    return {
      error: "VERIFY_FAILED",
      message: "No se pudo eliminar. Intenta de nuevo.",
    }
  } else {
    console.log(`[v0] [${correlationId}] DELETE_RING: Verified - Ring successfully deleted`)
  }

  // Step 5: Revalidate all relevant paths
  revalidateTag("rings")
  revalidatePath("/admin/dashboard")
  revalidatePath("/catalogo")
  if (ring.slug) {
    revalidatePath(`/catalogo/${ring.slug}`)
  }

  console.log(`[v0] [${correlationId}] DELETE_RING: Complete - Deleted ${ring.code} at`, new Date().toISOString())

  return { success: true }
}

export async function toggleRingActive(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("rings").update({ is_active: !isActive }).eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidateTag("rings")
  revalidatePath("/admin/dashboard")
  revalidatePath("/catalogo")
  return { success: true }
}

export async function updateRingOrder(updates: { id: string; order_index: number }[]) {
  const supabase = await createClient()

  // Update each ring's order_index
  const promises = updates.map(({ id, order_index }) => supabase.from("rings").update({ order_index }).eq("id", id))

  const results = await Promise.all(promises)

  const error = results.find((r) => r.error)
  if (error) {
    return { error: error.error!.message }
  }

  revalidateTag("rings")
  revalidatePath("/admin/dashboard")
  revalidatePath("/catalogo")
  return { success: true }
}
