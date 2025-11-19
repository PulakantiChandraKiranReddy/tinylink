import { GetServerSideProps } from "next";
import Link from "next/link";
import styles from "../../styles/Stats.module.css";

type LinkRow = {
  id: number;
  code: string;
  target: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
};

export default function StatsPage({ link }: { link: LinkRow }) {
  const rows = [
    { label: "Short Code", value: link.code },
    { label: "Target URL", value: link.target },
    { label: "Total Clicks", value: link.clicks },
    {
      label: "Created At",
      value: new Date(link.created_at).toLocaleString(),
    },
    {
      label: "Last Clicked",
      value: link.last_clicked
        ? new Date(link.last_clicked).toLocaleString()
        : "Never",
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Stats for: {link.code}</h1>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th>{row.label}</th>
                <td className={styles.valueCell}>
                  {row.label === "Target URL" ? (
                    <a
                      href={row.value as string}
                      target="_blank"
                      className={styles.urlLink}
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/" className={styles.button}>
        Back to Dashboard
      </Link>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params , req}) => {
  const code = params?.code as string;
   const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  const response = await fetch(
    `${baseUrl}/api/links/${code}`
  );
  const data = await response.json();

  if (!response.ok) {
    return { notFound: true };
  }

  return {
    props: { link: data },
  };
};
