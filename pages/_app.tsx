import "@/styles/globals.css";
import type { AppProps } from "next/app";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "../theme/theme";
import { ThemeProvider } from "@mui/material/styles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
  
      <Header/>
      <Component {...pageProps} />
      <Footer/>


    </ThemeProvider>
  );
}
