import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("links")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Short Code not found" });
    }

    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    const { error } = await supabaseAdmin
      .from("links")
      .delete()
      .eq("code", code);

    if (error) {
      return res.status(500).json({ error: "Failed to delete" });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
