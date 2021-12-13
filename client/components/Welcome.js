import { useState, useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/provider";
import styles from "../styles/Home.module.css";
import { supabase } from "./Supabase/SupabaseClient";
import Account from "./Supabase/Account";
import Auth from "./Supabase/Auth";

export default function Welcome() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(supabase.auth.session());
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <>
      <div>
        <h1 className={styles.title} style={{ marginBottom: "24px" }}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
      </div>
      <div>
        <ChakraProvider>
          {!session ? (
            <Auth />
          ) : (
            <Account key={session.user.id} session={session} />
          )}
        </ChakraProvider>
      </div>
    </>
  );
}
