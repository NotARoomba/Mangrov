import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShoppingBag,
  Users,
  Sparkles,
  TrendingUp,
  Heart,
  ArrowRight,
  CheckCircle,
  Zap,
  ArrowUp,
} from "lucide-react";
import { useNavigate } from "react-router";
import PageWrapper from "../components/PageWrapper";
import Strip from "../components/ImageStrip";

export default function About() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { scrollYProgress } = useScroll();

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

  // Enable scrolling for About page
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
              <img
                src="/icon.png"
                alt="Mangrov Logo"
                className="w-12 h-12 mr-4"
              />
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                Meet <span className="text-primary">Mangrov</span>
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-neutral-300 mb-8 leading-relaxed">
              Where{" "}
              <span className="text-primary font-semibold">
                personalized shopping
              </span>{" "}
              meets
              <span className="text-primary font-semibold">
                {" "}
                sustainable brands
              </span>
            </p>

            <div className="flex items-center justify-center space-x-8 text-neutral-400">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-primary mr-2" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-primary mr-2" />
                <span>Sustainable</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-primary mr-2" />
                <span>Community</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The <span className="text-primary">Harsh Reality</span>
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              <span className="text-primary font-semibold">
                60% of global greenhouse gas emissions
              </span>{" "}
              are caused by consumers, yet most don't care about sustainability.
              A few eco-conscious individuals won't tackle the climate crisis
              alone.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-8 h-8 text-primary mr-3" />
                  <h3 className="text-2xl font-bold text-white">
                    The Challenge
                  </h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Traditional sustainability messaging falls on deaf ears.
                  Consumers need
                  <span className="text-primary font-semibold">
                    {" "}
                    tangible value
                  </span>{" "}
                  they can feel when making eco-friendly choices.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
                <div className="flex items-center mb-4">
                  <Zap className="w-8 h-8 text-primary mr-3" />
                  <h3 className="text-2xl font-bold text-white">
                    Our Solution
                  </h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Instead of just repeating "eco-friendly", we offer
                  <span className="text-primary font-semibold">
                    {" "}
                    personalized experiences
                  </span>{" "}
                  that make sustainable shopping feel natural and rewarding.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-4 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The <span className="text-primary">Mangrov</span> Experience
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              We're creating the most seamless and personal shopping experience
              that's sustainable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered Recommendations",
                description:
                  "Precise product suggestions powered by advanced AI searches that understand your unique preferences.",
                color: "text-blue-400",
              },
              {
                icon: ShoppingBag,
                title: "Unique Product Display",
                description:
                  "Swipe through interactive cards to discover products in an engaging, intuitive way.",
                color: "text-green-400",
              },
              {
                icon: Users,
                title: "Community Trading",
                description:
                  "Trade items with other users to give products a second life and reduce waste together.",
                color: "text-purple-400",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-primary/50 transition-colors"
              >
                <div
                  className={`w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready for <span className="text-primary">Launch</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Prototype Complete
                    </h3>
                    <p className="text-neutral-300">
                      Fully functional platform ready for launch
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Community-Driven
                    </h3>
                    <p className="text-neutral-300">
                      Built for users who care about sustainability
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-2xl border border-primary/20"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Our Mission
              </h3>
              <p className="text-neutral-300 leading-relaxed mb-6">
                To create a global shift in consumer behavior by making
                sustainable shopping
                <span className="text-primary font-semibold">
                  {" "}
                  personal, engaging, and rewarding
                </span>
                .
              </p>
              <div
                className="flex items-center text-primary font-semibold cursor-pointer hover:text-primary/80 transition-colors"
                onClick={() => navigate("/dashboard")}
              >
                <span>Join the revolution</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="py-20 px-4 bg-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Be Part of the <span className="text-primary">Change</span>
            </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Experience shopping that doesn't just feel good—it does good. Join
              us in creating a sustainable future, one purchase at a time.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/80 transition-colors"
            >
              Get Started Today
            </motion.button>
          </motion.div>
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
