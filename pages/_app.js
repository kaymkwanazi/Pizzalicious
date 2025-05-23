import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/components/CartContext";
import { UserProvider } from "@/components/UserContext";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const hideNavbarRoutes = ["/login"];

  return (
    <UserProvider>
      <CartProvider>
        {!hideNavbarRoutes.includes(router.pathname) && <Navbar />}
        <Component {...pageProps} />
      </CartProvider>
    </UserProvider>
  );
}