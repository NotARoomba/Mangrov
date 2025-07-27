import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import TradeDetailModal from "../components/TradeDetailModal";

export default function TradeDetail() {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tradeId) return;
    const fetchTrade = async () => {
      try {
        const tradeDoc = await getDoc(doc(db, "trades", tradeId));
        if (tradeDoc.exists()) {
          setTrade({ id: tradeDoc.id, ...tradeDoc.data() });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrade();
  }, [tradeId]);

  // Show nothing until loaded
  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <TradeDetailModal
        trade={trade}
        isOpen={!!trade}
        onClose={() => navigate(-1)}
      />
    </div>
  );
}
