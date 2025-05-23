import "@/styles/globals.css";
import Navbar from "@/components/Navbar"; 
import {CartProvider} from "@/components/CartContext";

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Navbar />
      <Component {...pageProps} />
    </CartProvider>
  );
}