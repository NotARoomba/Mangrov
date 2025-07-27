import { ChevronDown, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import Select, { components, type StylesConfig } from "react-select";
import { INTERESTS } from "../utils/constants";

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
    <ChevronDown size={18} className="text-neutral-400" />
  </components.DropdownIndicator>
);

const inputClass =
  "rounded-md bg-muted px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 ring-primary focus:border-primary hover:border-primary transition duration-200 w-full border border-transparent";

export default function AddBox({
  type,
  title,
  setTitle,
  description,
  setDescription,
  images,
  setImages,
  price,
  setPrice,
  quantity,
  setQuantity,
  externalLink,
  setExternalLink,
  keywordInput,
  setKeywordInput,
  keywords,
  setKeywords,
  removeImage,
  removeKeyword,
  handleAddKeyword,
  niche,
  setNiche,
  errors,
  handleFileSelect,
  handleSubmit,
  loading,
  isValid,
  onBack,
}: any) {
  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto py-10 px-8 text-white space-y-6 overflow-y-scroll h-screen w-full"
    >
      <button onClick={onBack} className="text-neutral-400 text-sm">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4 capitalize">Add {type}</h2>
      {errors && <p className="text-red-500">{errors}</p>}

      {/* Title, Description, Quantity, Price, etc. */}
      {/* Same form elements as in AddPage... */}
      {/* Just use props instead of internal state */}

      <input
        className={inputClass}
        placeholder="External Link (optional)"
        value={externalLink}
        onChange={(e) => setExternalLink(e.target.value)}
      />

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
          {keywords.map((kw: string) => (
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
        options={INTERESTS.map((i) => ({
          label: i.label,
          value: i.id,
        }))}
        styles={darkSelectStyles}
        components={{ DropdownIndicator }}
        value={niche}
        onChange={(opt) => setNiche(opt.value)}
      />

      <button
        className="bg-primary px-4 py-2 rounded-md w-full uppercase font-bold"
        disabled={!isValid() || loading}
        onClick={handleSubmit}
      >
        {loading ? "Submitting..." : `Submit ${type}`}
      </button>
    </motion.div>
  );
}
