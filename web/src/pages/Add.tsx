import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Select, { components, type StylesConfig } from "react-select";
import { ChevronDown, Plus, X } from "lucide-react";
import { INTERESTS } from "../utils/constants";
import PageWrapper from "../components/PageWrapper";
import BackButton from "../components/BackButton";
import { db, storage } from "../utils/firebase"; // assume initialized
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

const primaryBtn =
  "bg-primary text-primary-foreground hover:bg-primary/80 transition duration-200 active:scale-95 uppercase tracking-wide font-bold py-2 rounded-md w-full cursor-pointer disabled:opacity-50";
const inputClass =
  "rounded-md bg-muted px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 ring-primary focus:border-primary hover:border-primary transition duration-200 w-full border border-transparent";

const wrapperAnim = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function AddPage() {
  const [stage, setStage] = useState<"select" | "form">("select");
  const [type, setType] = useState<"post" | "trade" | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [price, setPrice] = useState<string | number>("");
  const [quantity, setQuantity] = useState<string | number>("");
  const [externalLink, setExternalLink] = useState("");
  const [niche, setNiche] = useState<string | null>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid = () => {
    if (!title.trim() || !description.trim()) return false;
    if (type === "post" && images.length < 1) return false;
    if (type === "trade" && images.length !== 1) return false;
    if (type === "post" && (!price || !quantity)) return false;
    if (!niche) return false;
    return true;
  };

  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (type === "trade") {
      setImages([files[0]]);
    } else {
      setImages([...images, ...files]);
    }
  };

  const removeImage = (i: number) =>
    setImages(images.filter((_, idx) => idx !== i));
  const removeKeyword = (k: string) =>
    setKeywords(keywords.filter((kw) => kw !== k));

  const handleSubmit = async () => {
    if (!isValid()) {
      setErrors("Please fill in all required fields correctly.");
      return;
    }
    try {
      setLoading(true);
      const folder = type === "post" ? "post-images" : "trade-images";
      const urls: string[] = [];
      for (const file of images) {
        const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }

      const postData: any = {
        title,
        description,
        images: urls,
        url: externalLink || null,
        keywords,
        niche: niche,
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(
        collection(db, type === "post" ? "posts" : "trades"),
        type === "post"
          ? {
              ...postData,
              price: parseFloat(price as string),
              quantity: parseInt(quantity as string) || 1,
            }
          : postData
      );
      console.log("Document written: ", docRef.id);
      // reset form
      setStage("select");
    } catch (err) {
      console.error(err);
      setErrors("Upload failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {stage === "select" && (
          <motion.div
            key="select"
            {...wrapperAnim}
            className="flex flex-col md:flex-row items-center justify-center h-screen p-6 gap-6 text-white"
          >
            {["post", "trade"].map((opt) => (
              <button
                key={opt}
                className={`w-full h-1/2 md:h-full md:w-1/2 text-3xl rounded-2xl font-bold bg-neutral-900 hover:bg-neutral-800 transition hover:border-primary border-2 border-transparent cursor-pointer`}
                onClick={() => {
                  setType(opt as "post" | "trade");
                  setStage("form");
                }}
              >
                ADD {opt.toUpperCase()}
              </button>
            ))}
            <div className="absolute inset-0 pointer-events-none md:hidden">
              <div className="w-full h-[2px] bg-white/20" />
            </div>
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              <div className="w-[2px] h-full bg-white/20" />
            </div>
          </motion.div>
        )}

        {stage === "form" && (
          <motion.div
            key="form"
            {...wrapperAnim}
            className="max-w-2xl mx-auto py-10 px-8 text-white space-y-6"
          >
            <BackButton onClick={() => setStage("select")} />
            <h2 className="text-2xl font-bold mb-4 capitalize">Add {type}</h2>
            {errors && <p className="text-red-500">{errors}</p>}

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground block">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                placeholder="Enter title"
                className="mutedInput w-full"
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/30
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                placeholder="Enter description"
                className="mutedInput w-full h-28 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/300
              </p>
            </div>

            {type === "post" && (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Price */}
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground block mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) setPrice(val);
                      else if (e.target.value === "") setPrice("");
                    }}
                    inputMode="decimal"
                    className="mutedInput w-full no-spinner"
                  />
                </div>

                {/* Quantity */}
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0) setQuantity(val);
                      else if (e.target.value === "") setQuantity("");
                    }}
                    inputMode="numeric"
                    className="mutedInput w-full no-spinner"
                  />
                </div>
              </div>
            )}

            <input
              className={inputClass}
              placeholder="External Link (optional)"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
            />

            <div className="space-y-3">
              <label className="text-sm text-muted-foreground block">
                Upload{" "}
                {type === "trade" ? "exactly 1 image" : "one or more images"}
              </label>

              {!(type === "trade" && images.length >= 1) && (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple={type === "post"}
                    onChange={handleFileSelect}
                    id="file-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer border border-dashed border-white/30 hover:border-green-500 transition-colors duration-200 w-full flex flex-col items-center justify-center py-6 px-4 bg-neutral-900 rounded-lg text-sm text-white text-center hover:bg-neutral-800"
                  >
                    <Plus size={32} className="mb-2 text-primary" />
                    <span>
                      Click to {images.length ? "add more" : "upload"} image
                      {type === "post" ? "s" : ""}
                    </span>
                  </label>
                </div>
              )}

              {images.length > 0 && (
                <div className="flex justify-center mt-4">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative group w-full max-w-md">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-auto object-contain rounded-md border border-white/10"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 transition p-1 rounded-full text-white cursor-pointer"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Add keyword"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                />
                <button
                  onClick={handleAddKeyword}
                  className="bg-primary px-3 rounded-md hover:bg-primary/80"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((kw) => (
                  <div
                    key={kw}
                    className="bg-muted px-3 py-1 rounded-lg flex items-center gap-2"
                  >
                    <span>{kw}</span>
                    <button onClick={() => removeKeyword(kw)}>
                      <X size={16} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Select
              placeholder="Select niche"
              options={INTERESTS.map((i) => ({ label: i.label, value: i.id }))}
              styles={darkSelectStyles}
              components={{ DropdownIndicator }}
              value={niche}
              onChange={(opt) => setNiche(opt as string)}
            />

            <button
              className={primaryBtn}
              disabled={!isValid() || loading}
              onClick={handleSubmit}
            >
              {loading ? "Submitting..." : `Submit ${type}`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
