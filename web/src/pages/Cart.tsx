import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { useCart } from "../hooks/useCart";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Cart() {
  const { cart, totalPrice, updateQuantity, removeFromCart } = useCart();

  return (
    <PageWrapper className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Your Cart
            </h1>
          </div>
          <p className="text-neutral-400 text-sm md:text-base">
            {cart.length === 0
              ? "Start adding items to your cart"
              : `${cart.length} item${
                  cart.length === 1 ? "" : "s"
                } in your cart`}
          </p>
        </motion.div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 md:py-24"
          >
            <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-neutral-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-neutral-400 text-center max-w-md">
              Looks like you haven't added any items to your cart yet. Start
              exploring our collection!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="lg:col-span-2 space-y-4"
            >
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  variants={fadeIn}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-6 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover border border-neutral-700"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-neutral-400 text-sm mb-3">
                        ${item.price?.toFixed(2) ?? 0} each
                      </p>

                      {/* Mobile: Quantity controls */}
                      <div className="flex items-center justify-between md:hidden">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center text-white font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Desktop: Quantity controls and price */}
                    <div className="hidden md:flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center text-white font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          ${((item.price ?? 0) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors text-sm mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="border-t border-neutral-800 pt-4">
                    <div className="flex justify-between text-lg font-semibold text-white">
                      <span>Total</span>
                      <span className="text-primary">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </button>

                <p className="text-xs text-neutral-500 text-center mt-4">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
