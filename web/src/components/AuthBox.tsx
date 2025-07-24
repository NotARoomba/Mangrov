import { useState } from "react";
import { Mail, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Select, { components, type StylesConfig } from "react-select";
import countryList from "react-select-country-list";
import type { AuthStageType } from "../utils/types";
import { INTERESTS, LANGUAGES } from "../utils/constants";
import BackButton from "./BackButton";
import GreenSpinner from "./GreenSpinner";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

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

const isStrongPassword = (password: string) =>
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

export default function AuthBox() {
  const navigate = useNavigate();
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [password, setPassword] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  const emailValid = isValidEmail(email);
  const basicValid = name.trim().length > 1 && country && language;
  const interestsValid = selected.size > 0;
  const passwordStrong = isStrongPassword(password);

  const { user, pending } = useAuth();

  const handleEmailContinue = async () => {
    if (!emailValid) return setErrors("Please enter a valid email address");
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      setIsExistingUser(methods.length > 0);
      setStage(methods.length > 0 ? "verify" : "basic");
    } catch (err) {
      setErrors("Failed to check email. Please try again later.");
    }
  };

  const handleBasicContinue = () => {
    if (!basicValid) return setErrors("Fill out all required fields");
    setStage("interests");
  };

  const handleInterestsContinue = () => {
    if (!interestsValid) return setErrors("Select at least one interest");
    setStage("verify");
  };

  const handlePasswordSubmit = async () => {
    if (!passwordStrong)
      return setErrors(
        "Password must be at least 8 characters, include one uppercase, one number, and one special character"
      );

    try {
      if (isExistingUser) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, {
          displayName: name,
        });
        await setDoc(doc(db, "users", res.user.uid), {
          name,
          avatar: res.user.photoURL || "",
          country: country?.value || "",
          language: language?.value || "",
          interests: Array.from(selected),
        });
      }
      navigate("/dashboard");
    } catch (err) {
      setErrors("Authentication failed. Please check your credentials.");
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="mx-auto max-w-xs min-w-xs text-center pt-6">
      <motion.img
        src="/icon.png"
        alt="logo"
        className="w-24 h-24 mx-auto mb-2"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
      />

      {pending ? (
        <div className="flex justify-center items-center h-24">
          <GreenSpinner />
        </div>
      ) : user ? (
        <motion.div {...wrapperAnim} className="mt-4">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
          <p className="text-sm mb-4 text-white/70">
            Continue to your <span className="text-primary">dashboard</span>.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goToDashboard}
            className={`w-full rounded-md py-2 ${primaryBtn}`}
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      ) : (
        <>
          {errors && (
            <div
              className="bg-red-500/20 text-destructive text-sm rounded-md px-3 py-2 mb-4"
              role="alert"
            >
              {errors}
            </div>
          )}

          {stage !== "email" && (
            <BackButton
              onClick={() => {
                if (stage === "basic") {
                  setStage("email");
                } else if (stage === "interests") {
                  setStage("basic");
                } else if (stage === "verify") {
                  setStage(isExistingUser ? "email" : "interests");
                }
              }}
            />
          )}

          <AnimatePresence mode="wait">
            {stage === "email" && (
              <motion.div key="email" {...wrapperAnim}>
                <h2 className="text-3xl font-extrabold mb-0 text-white">
                  Welcome
                </h2>
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
                  These help us{" "}
                  <span className="text-primary">personalize</span> your
                  experience.
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
                        <p className="text-xs mt-2 px-1 pb-2 truncate">
                          {label}
                        </p>
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
                <h2 className="text-3xl font-extrabold mb-0 text-white">
                  {isExistingUser ? "Enter Password" : "Create Password"}
                </h2>
                <p className="text-sm mb-6">
                  {isExistingUser
                    ? "Welcome back, please enter your password."
                    : "Create a strong password to finish signing up."}
                </p>
                <label className="block text-sm text-left mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(null);
                  }}
                  className={`w-full mb-4 ${mutedInput}`}
                  placeholder="••••••••"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePasswordSubmit}
                  className={`w-full rounded-md py-2 ${primaryBtn}`}
                  disabled={!password}
                >
                  Continue
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
