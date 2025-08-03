import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import Sidebar from "../components/Sidebar";
import "../utils/firebase";
import { AnimatePresence } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { UnreadMessagesProvider } from "../hooks/useUnreadMessages";

export default function Root() {
  const { isSignedIn, pending } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const showSidebar = !["/", "/about"].includes(location.pathname);

  useEffect(() => {
    if (
      !pending &&
      !isSignedIn &&
      !["/", "/about"].includes(location.pathname)
    ) {
      navigate("/");
    }
  }, [isSignedIn, location.pathname, pending]);

  return (
    <UnreadMessagesProvider>
      <div className="max-h-screen font-inter bg-transparent-950 text-white">
        {/* <AnimatePresence>
          {spinnerVisible && location.pathname !== "/" && (
            <GlobalSpinner
              key="global-spinner"
              onDone={() => setSpinnerVisible(false)}
            />
          )}
        </AnimatePresence> */}

        {showSidebar && <Sidebar />}
        <main className={`${showSidebar ? "pl-14 md:pl-20" : ""}`}>
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>
    </UnreadMessagesProvider>
  );
}
