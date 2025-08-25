import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUp, FileText, Shield, Lock, Users, Scale } from "lucide-react";
import { useNavigate } from "react-router";
import PageWrapper from "../components/PageWrapper";
import Strip from "../components/ImageStrip";
import LanguageToggle from "../components/LanguageToggle";
import { translations } from "../utils/translations";

export default function TermsOfService() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [language, setLanguage] = useState<"en" | "es">("en");
  const { scrollYProgress } = useScroll();

  const t = translations.termsOfService[language];

  // Transform scroll progress for animations
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enable scrolling for Terms of Service page
  useEffect(() => {
    document.body.classList.add("allow-scroll");
    return () => {
      document.body.classList.remove("allow-scroll");
    };
  }, []);

  return (
    <PageWrapper className="min-h-screen bg-neutral-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Single Animated Image Strip with Parallax */}
        <motion.div style={{ y: y1 }} className="absolute inset-0">
          <Strip
            start={{ x: -200, y: 200 }}
            end={{ x: windowWidth + 200, y: 200 }}
            speed={25}
            className="opacity-15"
          />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-primary mr-4" />
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                {t.title.includes(" ") ? (
                  <>
                    {t.title.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="text-primary">
                      {t.title.split(" ").slice(-1)[0]}
                    </span>
                  </>
                ) : (
                  t.title
                )}
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-neutral-300 mb-8 leading-relaxed">
              {t.lastUpdated.includes(": ") ? (
                <>
                  {t.lastUpdated.split(": ")[0]}:{" "}
                  <span className="text-primary font-semibold">
                    {t.lastUpdated.split(": ")[1]}
                  </span>
                </>
              ) : (
                t.lastUpdated
              )}
            </p>

            <div className="flex items-center justify-center space-x-8 text-neutral-400">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-primary mr-2" />
                <span>Legal Protection</span>
              </div>
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-primary mr-2" />
                <span>Privacy First</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-primary mr-2" />
                <span>User Rights</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms of Service Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              {t.subtitle.includes(" ") ? (
                <>
                  {t.subtitle.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-primary">
                    {t.subtitle.split(" ").slice(-1)[0]}
                  </span>
                </>
              ) : (
                t.subtitle
              )}
            </h2>

            <LanguageToggle
              onLanguageChange={setLanguage}
              currentLanguage={language}
            />
          </motion.div>

          <div className="space-y-12">
            {/* Purpose */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Scale className="w-6 h-6 text-primary mr-3" />
                {t.sections.purpose.title}
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                {t.sections.purpose.content}
              </p>
            </motion.div>

            {/* User Registration */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 text-primary mr-3" />
                {t.sections.userRegistration.title}
              </h3>
              <ul className="text-neutral-300 leading-relaxed space-y-3">
                {t.sections.userRegistration.content.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </motion.div>

            {/* Permitted Products */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 text-primary mr-3" />
                {t.sections.permittedProducts.title}
              </h3>
              <ul className="text-neutral-300 leading-relaxed space-y-3">
                {t.sections.permittedProducts.content.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </motion.div>

            {/* Barter and Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Scale className="w-6 h-6 text-primary mr-3" />
                {t.sections.barterTransactions.title}
              </h3>
              <ul className="text-neutral-300 leading-relaxed space-y-3">
                {t.sections.barterTransactions.content.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </motion.div>

            {/* User Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 text-primary mr-3" />
                {t.sections.userResponsibilities.title}
              </h3>
              <p className="text-neutral-300 leading-relaxed mb-4">
                {t.sections.userResponsibilities.intro}
              </p>
              <ul className="text-neutral-300 leading-relaxed space-y-3">
                {t.sections.userResponsibilities.content.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </motion.div>

            {/* Mangrov's Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 text-primary mr-3" />
                {t.sections.mangrovResponsibilities.title}
              </h3>
              <ul className="text-neutral-300 leading-relaxed space-y-3">
                {t.sections.mangrovResponsibilities.content.map(
                  (item, index) => (
                    <li key={index}>• {item}</li>
                  )
                )}
              </ul>
            </motion.div>

            {/* Intellectual Property */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 text-primary mr-3" />
                {t.sections.intellectualProperty.title}
              </h3>
              <ul className="text-neutral-300 leading-relaxed space-y-3">
                {t.sections.intellectualProperty.content.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </motion.div>

            {/* Privacy and Personal Data */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Lock className="w-6 h-6 text-primary mr-3" />
                {t.sections.privacyData.title}
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                {t.sections.privacyData.content}
              </p>
            </motion.div>

            {/* Modifications */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 text-primary mr-3" />
                {t.sections.modifications.title}
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                {t.sections.modifications.content}
              </p>
            </motion.div>

            {/* Applicable Law */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              viewport={{ once: true }}
              className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Scale className="w-6 h-6 text-primary mr-3" />
                {t.sections.applicableLaw.title}
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                {t.sections.applicableLaw.content}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-neutral-950 py-12 px-4 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/icon.png" alt="Mangrov Logo" className="w-8 h-8 mr-3" />
            <h3 className="text-2xl font-bold text-white">Mangrov</h3>
          </div>
          <p className="text-neutral-400 text-base mb-6 leading-relaxed">
            Where personalized shopping meets sustainable brands
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-neutral-400">
            <span className="text-sm">
              © 2024 Mangrov. All rights reserved.
            </span>
            <span className="hidden sm:inline text-sm">•</span>
            <span
              className="text-sm cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate("/terms-of-service")}
            >
              Terms of Service
            </span>
            <span className="hidden sm:inline text-sm">•</span>
            <span
              className="text-sm cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate("/privacy-policy")}
            >
              Privacy Policy
            </span>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: showBackToTop ? 1 : 0,
          scale: showBackToTop ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-20 right-8 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/80 transition-colors"
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>
    </PageWrapper>
  );
}
