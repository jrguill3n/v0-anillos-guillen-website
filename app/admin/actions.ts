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
    name: (formData.get("code") as string).toUpperCase(),
    description: formData.get("description") as string,
    price: Number.parseFloat(formData.get("price") as string),
    metal_type: "oro",
    metal_karat: formData.get("metal_karat") as string,
    metal_color: formData.get("metal_color") as string,
    diamond_points: Number.parseFloat(formData.get("diamond_points") as string),
    diamond_color: "incoloro",
    diamond_clarity: "vs1",
    image_url: formData.get("image_url") as string,
    featured: false,
    is_active: formData.get("is_active") === "true",
    slug: (formData.get("code") as string).toLowerCase().replace(/\s+/g, "-"),
    order_index: 0,
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
    name: (formData.get("code") as string).toUpperCase(),
    description: formData.get("description") as string,
    price: Number.parseFloat(formData.get("price") as string),
    metal_type: "oro",
    metal_karat: formData.get("metal_karat") as string,
    metal_color: formData.get("metal_color") as string,
    diamond_points: Number.parseFloat(formData.get("diamond_points") as string),
    diamond_color: "incoloro",
    diamond_clarity: "vs1",
    image_url: formData.get("image_url") as string,
    featured: false,
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

  // Step 1: Call the atomic RPC function for transactional delete
  const { data, error: rpcError } = await supabase.rpc("delete_ring_atomic", {
    ring_id: id,
  })

  if (rpcError) {
    console.error(`[v0] [${correlationId}] DELETE_RING: RPC error:`, rpcError)

    // Check specific error codes from the RPC function
    if (rpcError.message && rpcError.message.includes("NOT_FOUND")) {
      return { error: "NOT_FOUND", message: "Este anillo ya no existe" }
    }

    if (rpcError.message && rpcError.message.includes("CONSTRAINT")) {
      return {
        error: "CONSTRAINT",
        message: "No se pudo eliminar porque está relacionado con otros datos.",
      }
    }

    if (rpcError.message && rpcError.message.includes("VERIFY_FAILED")) {
      return {
        error: "VERIFY_FAILED",
        message: "No se pudo eliminar. Intenta de nuevo.",
      }
    }

    return { error: "DELETE_ERROR", message: `Error al eliminar: ${rpcError.message}` }
  }

  // Step 2: Check the response from RPC
  if (!data || !data.success) {
    console.error(`[v0] [${correlationId}] DELETE_RING: RPC returned unsuccessful result:`, data)
    
    // Map the RPC error to our error codes
    if (data?.error === "NOT_FOUND") {
      return { error: "NOT_FOUND", message: data?.message || "Este anillo ya no existe" }
    }
    
    if (data?.error === "CONSTRAINT") {
      return { error: "CONSTRAINT", message: data?.message || "No se pudo eliminar porque está relacionado con otros datos." }
    }
    
    if (data?.error === "VERIFY_FAILED") {
      return { error: "VERIFY_FAILED", message: data?.message || "No se pudo eliminar. Intenta de nuevo." }
    }
    
    return {
      error: "DELETE_ERROR",
      message: data?.message || "No se pudo eliminar el anillo",
    }
  }

  console.log(`[v0] [${correlationId}] DELETE_RING: Successfully deleted ring:`, {
    code: data.code,
    name: data.name,
    slug: data.slug,
  })

  // Step 3: Revalidate all relevant paths
  revalidateTag("rings")
  revalidatePath("/admin/dashboard")
  revalidatePath("/catalogo")
  if (data.slug) {
    revalidatePath(`/catalogo/${data.slug}`)
  }

  console.log(`[v0] [${correlationId}] DELETE_RING: Complete - Deleted ${data.code} at`, new Date().toISOString())

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

export async function getAdminRings() {
  const correlationId = logDbConnection("GET_ADMIN_RINGS")
  
  // Force cache invalidation before fetch
  revalidateTag("rings")
  revalidatePath("/admin/dashboard")

  const supabase = await createClient()

  console.log(`[v0] [${correlationId}] GET_ADMIN_RINGS: Fetching ALL rings at ${new Date().toISOString()}`)

  const { data: rings, error } = await supabase
    .from("rings")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) {
    console.error(`[v0] [${correlationId}] GET_ADMIN_RINGS: Error:`, error)
    return { error: error.message, rings: [] }
  }

  console.log(`[v0] [${correlationId}] GET_ADMIN_RINGS: Fetched ${rings?.length || 0} rings`)

  return { success: true, rings: rings || [] }
}

export async function getPublicRings() {
  const correlationId = logDbConnection("GET_PUBLIC_RINGS")
  revalidateTag("rings")
  revalidatePath("/catalogo")

  const supabase = await createClient()

  console.log(`[v0] [${correlationId}] GET_PUBLIC_RINGS: Fetching active rings at ${new Date().toISOString()}`)

  const { data: rings, error } = await supabase
    .from("rings")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true })

  if (error) {
    console.error(`[v0] [${correlationId}] GET_PUBLIC_RINGS: Error:`, error)
    return { error: error.message, rings: [] }
  }

  console.log(`[v0] [${correlationId}] GET_PUBLIC_RINGS: Fetched ${rings?.length || 0} active rings`)

  return { success: true, rings: rings || [] }
}

export async function diagnosticCatalog() {
  const correlationId = logDbConnection("DIAGNOSTIC_CATALOG")
  const supabase = await createClient()

  console.log(`[v0] [${correlationId}] DIAGNOSTIC: Starting catalog diagnostic...`)

  try {
    // 1. Get total count
    const { count: totalCount } = await supabase
      .from("rings")
      .select("*", { count: "exact", head: true })

    console.log(`[v0] [${correlationId}] DIAGNOSTIC: Total rings: ${totalCount}`)

    // 2. Get active count
    const { count: activeCount } = await supabase
      .from("rings")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    console.log(`[v0] [${correlationId}] DIAGNOSTIC: Active rings: ${activeCount}`)

    // 3. Check for duplicate codes
    const { data: allRings } = await supabase.from("rings").select("id, code, slug")

    const codeFreq: Record<string, string[]> = {}
    const slugFreq: Record<string, string[]> = {}

    allRings?.forEach((ring: any) => {
      if (!codeFreq[ring.code]) codeFreq[ring.code] = []
      codeFreq[ring.code].push(ring.id)

      if (!slugFreq[ring.slug]) slugFreq[ring.slug] = []
      slugFreq[ring.slug].push(ring.id)
    })

    const duplicateCodes = Object.entries(codeFreq).filter(([_, ids]) => ids.length > 1)
    const duplicateSlugs = Object.entries(slugFreq).filter(([_, ids]) => ids.length > 1)

    console.log(`[v0] [${correlationId}] DIAGNOSTIC: Duplicate codes: ${duplicateCodes.length}`, duplicateCodes)
    console.log(`[v0] [${correlationId}] DIAGNOSTIC: Duplicate slugs: ${duplicateSlugs.length}`, duplicateSlugs)

    // 4. Check for specific ring
    const has2322 = allRings?.some((r: any) => r.code === "Anillo 2322" || r.slug === "anillo-2322")
    console.log(`[v0] [${correlationId}] DIAGNOSTIC: Anillo 2322 exists: ${has2322}`)

    return {
      totalCount,
      activeCount,
      duplicateCodes: duplicateCodes.map(([code, ids]) => ({ code, count: ids.length, ids })),
      duplicateSlugs: duplicateSlugs.map(([slug, ids]) => ({ slug, count: ids.length, ids })),
      has2322,
    }
  } catch (error) {
    console.error(`[v0] [${correlationId}] DIAGNOSTIC: Error:`, error)
    return { error: String(error) }
  }
}
  const correlationId = logDbConnection("CLEAR_ALL_RINGS")
  const supabase = await createClient()

  console.log(`[v0] [${correlationId}] CLEAR_ALL_RINGS: Attempting to delete all rings...`)

  // First get count for logging
  const { count: beforeCount } = await supabase
    .from("rings")
    .select("*", { count: "exact", head: true })

  console.log(`[v0] [${correlationId}] CLEAR_ALL_RINGS: Found ${beforeCount} rings to delete`)

  // Delete all rings - use gte on created_at to match all rows
  const { error, count: deletedCount } = await supabase
    .from("rings")
    .delete({ count: "exact" })
    .gte("created_at", "1970-01-01")

  if (error) {
    console.error(`[v0] [${correlationId}] CLEAR_ALL_RINGS: Error:`, error)
    return { error: error.message }
  }

  console.log(`[v0] [${correlationId}] CLEAR_ALL_RINGS: Deleted ${deletedCount} rings`)

  // Verify deletion
  const { count: afterCount } = await supabase
    .from("rings")
    .select("*", { count: "exact", head: true })

  console.log(`[v0] [${correlationId}] CLEAR_ALL_RINGS: Remaining rings: ${afterCount}`)

  if (afterCount && afterCount > 0) {
    console.error(`[v0] [${correlationId}] CLEAR_ALL_RINGS: WARNING - ${afterCount} rings still remain!`)
  }

  // Revalidate all relevant paths
  revalidateTag("rings")
  revalidatePath("/admin/dashboard")
  revalidatePath("/catalogo")

  console.log(`[v0] [${correlationId}] CLEAR_ALL_RINGS: Complete at ${new Date().toISOString()}`)

  return { success: true, deletedCount: deletedCount || 0 }
}
