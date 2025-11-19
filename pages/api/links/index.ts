import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch links" });
    }

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { target, code } = req.body;

    let validUrl = "";
    try {
      const parsed = new URL(target);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return res.status(400).json({ error: "Invalid URL" });
      }
      validUrl = parsed.toString();
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    if (!code) {
      return res.status(400).json({ error: "Short code is required" });
    }

    if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
      return res.status(400).json({ error: "Custom code must be 6–8 chars" });
    }

    const { data: existing } = await supabaseAdmin
      .from("links")
      .select("code")
      .eq("code", code)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Short code already exists" });
    }

    const { data, error } = await supabaseAdmin
      .from("links")
      .insert({
        code,
        target: validUrl,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to create link" });
    }

    return res.status(201).json(data);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
