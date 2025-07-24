import { motion } from "framer-motion";
import { useCart } from "../hooks/useCart";

export default function ProductPicker({ products }: { products: any[] }) {
  const { cart, addToCart, updateQuantity } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 bottom-10 right-0 bg-neutral-900 rounded-xl p-4 w-72 shadow-xl border border-neutral-700 space-y-3"
    >
      {products.map((prod) => {
        const inCart = cart.find((item) => item.id === prod.productId);
        return (
          <div
            key={prod.productId}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex-1">
              <p className="font-medium">{prod.name}</p>
              <p className="text-xs text-neutral-400">
                ${prod.price?.toFixed(2)}
              </p>
            </div>

            {inCart ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(prod.productId, inCart.quantity - 1)
                  }
                  className="px-2 text-white cursor-pointer hover:text-primary"
                >
                  −
                </button>
                <input
                  //   type="number"
                  min={1}
                  className="w-10 text-center bg-transparent border border-neutral-700 rounded text-white hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={inCart.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      prod.productId,
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                />
                <button
                  onClick={() =>
                    updateQuantity(prod.productId, inCart.quantity + 1)
                  }
                  className="px-2 text-white cursor-pointer hover:text-primary"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  addToCart({
                    id: prod.productId,
                    name: prod.name,
                    price: prod.price,
                    image: prod.image || "",
                    quantity: 1,
                  })
                }
                className="bg-primary text-sm px-3 py-1 rounded cursor-pointer hover:opacity-90"
              >
                Add to Cart
              </button>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
