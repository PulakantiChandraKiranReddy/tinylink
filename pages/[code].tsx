// pages/[code].tsx
import { GetServerSideProps } from "next";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export default function RedirectPage() {
  return <div>Redirecting...</div>;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const code = params?.code as string;

  // 1️⃣ Find the link
  const { data: link, error } = await supabaseAdmin
    .from("links")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error || !link) {
    return { notFound: true  };
  }

  // 2️⃣ Increment clicks
  await supabaseAdmin
    .from("links")
    .update({
      clicks: link.clicks + 1,
      last_clicked: new Date().toISOString(),
    })
    .eq("code", code);

  // 3️⃣ Redirect to target
  return {
    redirect: {
      destination: link.target,
      permanent: false, // 302
    },
  };
};
