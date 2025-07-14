import { useEffect, useState } from "react";
import { Mail, ChevronDown, Check } from "lucide-react";
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
import type { AuthStageType } from "../utils/types";
import { INTERESTS, LANGUAGES } from "../utils/constants";
import BackButton from "./BackButton";

const auth = getAuth();

const primaryBtn =
  "bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer transition-all duration-200 active:scale-95 uppercase tracking-widest font-bold disabled:opacity-40 disabled:cursor-not-allowed";
const mutedInput =
  "rounded-md bg-muted px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/80 transition-all duration-200";

const wrapperAnim = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const darkSelectStyles: StylesConfig = {
  control: (base) => ({
    ...base,
    background: "#1b1b1b",
    border: "none",
    minHeight: "2.6rem",
    cursor: "pointer",
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (e: string) => emailRegex.test(e);

export default function AuthBox() {
  const [stage, setStage] = useState<AuthStageType>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [language, setLanguage] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<string | null>(null);

  const emailValid = isValidEmail(email);
  const basicValid = name.trim().length > 1 && country && language;
  const interestsValid = selected.size > 0;

  const handleEmailContinue = async () => {
    if (!emailValid) return setErrors("Please enter a valid email address");
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length) {
        await sendMagicLink();
        setStage("verify");
      } else {
        setStage("basic");
      }
    } catch (err) {
      setErrors("Failed to check email. Please try again later.");
    }
  };
  const handleBasicContinue = () => {
    if (!basicValid) return setErrors("Fill out all required fields");
    setStage("interests");
  };
  const handleInterestsContinue = async () => {
    if (!interestsValid) return setErrors("Select at least one interest");
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
  return (
    <div className="mx-auto max-w-xs min-w-xs text-center pt-6">
      {stage !== "email" && (
        <BackButton
          onClick={() => {
            setErrors(null);
            setStage("email");
          }}
        />
      )}

      <motion.img
        src="/icon.png"
        alt="logo"
        className="w-24 h-24 mx-auto mb-2"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
      />

      {errors ? (
        <div
          className="bg-destructive/20 text-destructive text-sm rounded-md px-3 py-2 mb-4"
          role="alert"
        >
          {errors}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {stage === "email" && (
          <motion.div key="email" {...wrapperAnim}>
            <h2 className="text-3xl font-extrabold mb-0 text-white">Welcome</h2>
            <p className="text-sm mb-6">
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(null);
                }}
                className={`pl-10 w-full ${mutedInput}`}
                placeholder="you@example.com"
              />
            </div>
            <motion.button
              onClick={handleEmailContinue}
              className={`mt-6 w-full rounded-md py-2 ${primaryBtn}`}
              disabled={!emailValid}
            >
              Continue
            </motion.button>

            <p className="text-xs mt-3 opacity-60">
              Terms and conditions
              <span className="text-primary font-semibold">**</span>
            </p>
            <div className="flex items-center gap-2 my-6">
              <span className="flex-1 h-px bg-white/40" />
              <span className="text-xs tracking-widest opacity-60">OR</span>
              <span className="flex-1 h-px bg-white/40" />
            </div>
            <motion.button className="w-full border border-muted-foreground/60 rounded-md py-2 flex items-center justify-center gap-2 cursor-pointer">
              {/* Google icon */}
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
            <h2 className="text-3xl font-extrabold mb-0 text-white">
              Basic Info
            </h2>
            <p className="text-sm mb-5">
              Let us get to <span className="text-primary">know</span> you
              better.
            </p>

            <label className="block text-sm text-left mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors(null);
              }}
              placeholder="John Doe"
              className={`w-full mb-3 ${mutedInput}`}
            />

            <label className="block text-sm text-left mb-1">Country</label>
            <Select
              instanceId="country"
              options={countryList().getData()}
              value={country}
              onChange={(v) => {
                setCountry(v as any);
                setErrors(null);
              }}
              placeholder="Select country"
              styles={darkSelectStyles}
              components={{ DropdownIndicator }}
              className="mb-3 text-left"
              menuShouldScrollIntoView={false}
            />

            <label className="block text-sm text-left mb-1">Language</label>
            <Select
              instanceId="language"
              options={LANGUAGES}
              value={language}
              onChange={(val) => {
                setLanguage(val as any);
                setErrors(null);
              }}
              placeholder="Select language"
              styles={darkSelectStyles}
              components={{ DropdownIndicator }}
              className="mb-3 text-left"
            />

            <motion.button
              onClick={handleBasicContinue}
              className={`mt-8 w-full rounded-md py-2 ${primaryBtn}`}
              disabled={!basicValid}
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {stage === "interests" && (
          <motion.div key="interests" {...wrapperAnim}>
            <h2 className="text-3xl font-extrabold mb-0 text-white">
              Interests
            </h2>
            <p className="text-sm mb-4">
              These help us <span className="text-primary">personalize</span>{" "}
              your experience.
            </p>

            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full mb-4 ${mutedInput}`}
            />

            <div className="grid grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-1">
              {INTERESTS.filter(({ label }) =>
                label.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(({ id, label, img }) => {
                const isSelected = selected.has(id);
                return (
                  <div
                    key={id}
                    onClick={() => {
                      setSelected((prev) => {
                        const next = new Set(prev);
                        next.has(id) ? next.delete(id) : next.add(id);
                        return next;
                      });
                      setErrors(null);
                    }}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 ${
                      isSelected ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={label}
                      className="w-full h-24 object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-primary p-1 rounded-full">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                    <p className="text-xs mt-2 px-1 pb-2 truncate">{label}</p>
                  </div>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleInterestsContinue}
              className={`w-full rounded-md py-2 mt-6 ${primaryBtn}`}
              disabled={!interestsValid}
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
              className={`w-full rounded-md py-2 ${primaryBtn}`}
            >
              Waiting for verification…
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
