import "@/css/tailwind.css";
import "@fontsource/inter/variable-full.css";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import siteMetadata from "@/data/siteMetadata";
import LayoutWrapper from "@/components/LayoutWrapper";
import { CloudCannonConnect } from "@cloudcannon/react-connector";

export default function App({ Component, pageProps }) {
  const AppComponent = CloudCannonConnect(Component, {
    processProps: (props) => {
      return props;
    },
  });

  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme}>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <LayoutWrapper>
        <AppComponent {...pageProps} />
      </LayoutWrapper>
    </ThemeProvider>
  );
}
