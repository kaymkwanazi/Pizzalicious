import "@/styles/globals.css";
import Navbar from "@/components/Navbar"; // Adjust the path if necessary

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}