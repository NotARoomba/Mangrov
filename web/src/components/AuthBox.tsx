import React, { useEffect, useState } from "react";
import {
  Mail,
  ArrowLeft,
  ChevronDown,
  Divide,
  ArrowRight,
  GanttChart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAuth,
  fetchSignInMethodsForEmail,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
} from "firebase/auth";
import Select, { components, type StylesConfig } from "react-select";
import countryList from "react-select-country-list";

const auth = getAuth();

type Stage = "email" | "basic" | "interests" | "verify";

const primaryBtn =
  "bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer transition-all duration-200 active:scale-95 uppercase tracking-widest font-bold";
const mutedInput =
  "rounded-md bg-muted px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/80 transition-all duration-200";

const wrapperAnim = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  //   transition: { duration: 0.4, ease: [0.25, 0.8, 0.25, 1] },
};

const darkSelectStyles: StylesConfig = {
  control: (base) => ({
    ...base,
    background: "#1b1b1b",
    border: "none",
    minHeight: "2.6rem",
  }),
  singleValue: (b) => ({ ...b, color: "#fff" }),
  input: (b) => ({ ...b, color: "#fff" }),
  placeholder: (b) => ({ ...b, color: "#888" }),
  menu: (b) => ({ ...b, background: "#1b1b1b" }),
  option: (b, s) => ({
    ...b,
    background: s.isFocused ? "#2a2a2a" : "#1b1b1b",
    color: "#fff",
    cursor: "pointer",
  }),
  indicatorSeparator: () => ({ display: "none" }),
};
const DropdownIndicator = (props: any) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown size={18} className="text-muted-foreground" />
  </components.DropdownIndicator>
);

export default function AuthBox() {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [language, setLanguage] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  /* ───────────────── Email flow */
  const handleEmailContinue = async () => {
    if (!email) return;
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length) {
      await sendMagicLink();
      setStage("verify");
    } else {
      setStage("basic");
    }
  };
  const handleBasicContinue = () => setStage("interests");
  const handleInterestsContinue = async () => {
    await sendMagicLink();
    setStage("verify");
  };
  const sendMagicLink = async () => {
    if (codeSent) return;
    await sendSignInLinkToEmail(auth, email, {
      url: `${window.location.origin}/dashboard`,
      handleCodeInApp: true,
    });
    localStorage.setItem("emailForSignIn", email);
    setCodeSent(true);
  };
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = localStorage.getItem("emailForSignIn") || email;
      signInWithEmailLink(auth, storedEmail, window.location.href).then(() => {
        localStorage.removeItem("emailForSignIn");
        window.location.assign("/dashboard");
      });
    }
  }, [email]);

  const Divider = () => (
    <div className="flex items-center gap-2 my-6">
      <span className="flex-1 h-px bg-muted-foreground/40" />
      <span className="text-xs tracking-widest opacity-60">OR</span>
      <span className="flex-1 h-px bg-muted-foreground/40" />
    </div>
  );

  const Terms = () => (
    <p className="text-xs mt-3 opacity-60">
      Terms and conditions<span className="text-primary font-semibold">**</span>
    </p>
  );

  const BackButton = () => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setStage("email")}
      className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100 mb-4 cursor-pointer transition-all duration-300"
    >
      <ArrowLeft size={18} /> Back
    </motion.button>
  );

  /* ───────────────── UI */
  return (
    <div className="mx-auto max-w-xs min-w-xs text-center pt-6">
      {stage !== "email" && <BackButton />}

      {/* Logo */}
      <motion.img
        src="/icon.png"
        alt="logo"
        className="w-24 h-24 mx-auto mb-2"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
      />

      <AnimatePresence mode="wait">
        {stage === "email" && (
          <motion.div key="email" {...wrapperAnim}>
            <h2 className="text-3xl font-extrabold mb-0">
              <span className="text-white">Welcome</span>
            </h2>
            <p className="text-sm mb-6 opacity-100">
              Enter your <span className="text-primary">email</span> to
              continue.
            </p>

            <label className="block text-sm text-left mb-1">Email</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 w-full ${mutedInput}`}
                placeholder="you@example.com"
              />
            </div>
            <motion.button
              onClick={handleEmailContinue}
              className={`mt-6 w-full rounded-md py-2 ${primaryBtn}`}
            >
              Continue
            </motion.button>

            <Terms />
            <Divider />
            <motion.button className="w-full border border-muted-foreground/60 rounded-md py-2 flex items-center justify-center gap-2 cursor-pointer">
              {/* Simple G icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-4 h-4"
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C34.1 33.4 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 3.1l5.7-5.7C34.3 5 29.5 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c11.6 0 20.7-9 21-20.5.1-.8.1-1.7.1-2.5 0-1.4-.1-2.8-.3-4z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.1l6.6 4.8C14.3 15.1 18.8 12 24 12c3.1 0 5.9 1.1 8.1 3.1l5.7-5.7C34.3 5 29.5 3 24 3 15.6 3 8.4 7.6 6.3 14.1z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 45c5.4 0 10.3-2 14-5.3l-6.5-5.4C29.7 35.9 27 37 24 37c-5.5 0-10-3.5-11.7-8.3l-6.6 5.1C8.4 40.4 15.6 45 24 45z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3C34.7 32.5 29.7 37 24 37c-5.5 0-10-3.5-11.7-8.3l-6.6 5.1C8.4 40.4 15.6 45 24 45c11.6 0 20.7-9 21-20.5.1-.8.1-1.7.1-2.5 0-1.4-.1-2.8-.3-4z"
                />
              </svg>
              Continue with Google
            </motion.button>
          </motion.div>
        )}

        {stage === "basic" && (
          <motion.div key="basic" {...wrapperAnim}>
            <h2 className="text-3xl font-extrabold mb-0">
              <span className="text-white">Basic Info</span>
            </h2>
            <p className="text-sm mb-5 opacity-100">
              Let us get to <span className="text-primary">know</span> you
              better.
            </p>

            <label className="block text-sm text-left mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={`w-full mb-3 ${mutedInput}`}
            />

            <label className="block text-sm text-left mb-1">Country</label>
            <Select
              instanceId="country"
              options={countryList().getData()}
              value={country}
              onChange={(v) => setCountry(v as any)}
              placeholder="Select country"
              styles={darkSelectStyles}
              components={{ DropdownIndicator }}
              className="mb-3 text-left"
            />

            <label className="block text-sm text-left mb-1">Language</label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`appearance-none w-full pr-8 cursor-pointer ${mutedInput}`}
              >
                <option value="" disabled>
                  Select language
                </option>
                {["English", "Español", "Français", "Deutsch", "Português"].map(
                  (l) => (
                    <option key={l}>{l}</option>
                  )
                )}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>

            <motion.button
              onClick={handleBasicContinue}
              className={`mt-8 w-full rounded-md py-2 ${primaryBtn}`}
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {stage === "interests" && (
          <motion.div key="interests" {...wrapperAnim}>
            <h2 className="text-3xl font-extrabold mb-0">
              <span className="text-white">Interests</span>
            </h2>
            <p className="text-sm mb-4 opacity-100">
              This helps us <span className="text-primary">personalize</span>{" "}
              your experience.
            </p>
            {/* TODO interests */}
            <motion.button
              onClick={handleInterestsContinue}
              className={`w-full rounded-md py-2 mt-6 ${primaryBtn}`}
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {stage === "verify" && (
          <motion.div key="verify" {...wrapperAnim}>
            <h2 className="text-2xl font-extrabold mb-1">
              <span className="text-primary">Verification</span>
            </h2>
            <p className="text-sm mb-6 opacity-70">
              Check <span className="italic text-primary/80">{email}</span> for
              your link.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled
              className={`w-full rounded-md py-2 ${primaryBtn} opacity-60 cursor-not-allowed`}
            >
              Waiting for verification…
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
