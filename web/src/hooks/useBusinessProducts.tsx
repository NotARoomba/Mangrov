import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";

export function useBusinessProducts(businessId: string | undefined) {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    if (!businessId) return;
    (async () => {
      const snap = await getDocs(
        collection(db, "businesses", businessId, "products")
      );
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, [businessId]);
  return products;
}
