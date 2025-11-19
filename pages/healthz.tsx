// pages/healthz.tsx
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true, version: "0.1.0", name: "tinylink", }));
  return { props: {} };
};

export default function HealthPage() {
  return null;
}
