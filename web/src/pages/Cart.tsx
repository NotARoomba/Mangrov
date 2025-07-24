import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { useCart } from "../hooks/useCart";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
};

export default function Cart() {
  const { cart, totalPrice, updateQuantity, removeFromCart } = useCart();

  return (
    <PageWrapper className="max-w-3xl mx-auto py-16 px-4 space-y-8">
      <motion.h1 {...fadeIn} className="text-3xl font-bold text-center">
        Your Cart
      </motion.h1>

      {cart.length === 0 ? (
        <motion.p {...fadeIn} className="text-neutral-400 text-center">
          Your cart is empty.
        </motion.p>
      ) : (
        <>
          <motion.div {...fadeIn} className="space-y-6">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                {...fadeIn}
                className="flex items-center justify-between bg-neutral-900 border border-neutral-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover border border-neutral-700"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-neutral-400 text-sm">
                      ${item.price?.toFixed(2) ?? 0} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 text-white cursor-pointer hover:text-primary"
                  >
                    -
                  </button>
                  <input
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.id,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-12 text-center bg-transparent border border-neutral-700 rounded text-white hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 text-white cursor-pointer hover:text-primary"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 bg-red-600 hover:bg-red-700 transition px-3 py-1 text-sm rounded text-white cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            {...fadeIn}
            className="border-t border-neutral-700 pt-6 text-right space-y-2"
          >
            <p className="text-lg font-semibold">
              Total:{" "}
              <span className="text-primary">${totalPrice.toFixed(2)}</span>
            </p>
            <button className="bg-primary px-6 py-2 rounded text-sm font-medium hover:opacity-90 transition cursor-pointer">
              Proceed to Checkout
            </button>
          </motion.div>
        </>
      )}
    </PageWrapper>
  );
}
