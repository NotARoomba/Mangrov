import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Select, { components, type StylesConfig } from "react-select";
import { ArrowLeftRight, ChevronDown, Plus, PlusCircle, X } from "lucide-react";
import { INTERESTS } from "../utils/constants";
import PageWrapper from "../components/PageWrapper";
import BackButton from "../components/BackButton";
import { db, storage } from "../utils/firebase"; // assume initialized
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageStrip from "../components/ImageStrip";
import useWindowSize from "../hooks/useWindowSize";
import AddBox from "../components/AddBox";

const wrapperAnim = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function AddPage() {
  const [stage, setStage] = useState<"select" | "form">("select");
  const [type, setType] = useState<"post" | "trade" | null>(null);

  const buffer = 200; // Distance away from screen for dramatic effect
  const randomX = (direction: "left" | "right", type: "start" | "end") => {
    if (direction === "left") {
      if (type === "start") {
        // start offscreen to the left
        return -buffer - Math.random() * 200;
      } else {
        // end offscreen to the right
        return width + buffer + Math.random() * 200;
      }
    } else {
      if (type === "start") {
        // start offscreen to the right
        return width + buffer + Math.random() * 200;
      } else {
        // end offscreen to the left
        return -buffer - Math.random() * 200;
      }
    }
  };

  const [width, height] = useWindowSize();
  const [stripData, setStripData] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  }>(() => {
    const direction = Math.random() > 0.5 ? "left" : "right";
    return {
      start: {
        x: randomX(direction, "start"),
        y: -buffer, // top
      },
      end: {
        x: randomX(direction, "end"),
        y: height + buffer, // bottom
      },
    };
  });

  return (
    <>
      <PageWrapper className={`relative h-screen overflow-hidden`}>
        <AnimatePresence mode="wait">
          {stage === "select" && (
            <motion.div
              key="select"
              {...wrapperAnim}
              className="flex flex-col overflow-hidden overflow-x-hidden overflow-y-hidden md:flex-row items-center justify-center h-screen p-6 gap-6 text-white"
            >
              {["trade"].map((opt) => {
                const Icon = opt === "post" ? PlusCircle : ArrowLeftRight;

                return (
                  <button
                    key={opt}
                    onMouseEnter={() => {
                      const direction = opt === "post" ? "left" : "right";

                      const start = {
                        x: randomX(direction, "start"),
                        y: -buffer,
                      };

                      const end = {
                        x: randomX(direction, "end"),
                        y: height + buffer,
                      };

                      setStripData({ start, end });
                    }}
                    onClick={() => {
                      setType(opt as "post" | "trade");
                      setStage("form");
                    }}
                    className="w-full h-1/2 md:h-full md:w-1/2 text-4xl rounded-2xl font-bold bg-neutral-900 hover:bg-neutral-800 transition hover:border-primary border-2 border-transparent cursor-pointer flex flex-col items-center justify-center gap-3 hover:scale-105 duration-300"
                  >
                    <Icon className="w-10 h-10" />
                    ADD {opt.toUpperCase()}
                  </button>
                );
              })}
            </motion.div>
          )}
          {stage === "form" && type && (
            <AddBox type={type} setStage={setStage} />
          )}
          {/* {stage === "form" && (
            <motion.div
              key="form"
              {...wrapperAnim}
              className="max-w-2xl mx-auto py-10 px-8 text-white space-y-6 overflow-y-scroll h-screen w-full"
            >
              <BackButton onClick={() => setStage("select")} />
              <h2 className="text-2xl font-bold mb-4 capitalize">Add {type}</h2>
              {errors && <p className="text-red-500">{errors}</p>}

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <label>Title</label>
                  <span>{title.length}/30</span>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                  placeholder="Enter a short title"
                  className="w-full rounded-md bg-neutral-900 text-white placeholder-neutral-500 px-4 py-2 outline-none border border-neutral-700 focus:border-green-500 transition"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <label>Description</label>
                  <span>{description.length}/300</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                  placeholder="Enter a brief description"
                  className="w-full rounded-md bg-neutral-900 text-white placeholder-neutral-500 px-4 py-2 h-28 resize-none outline-none border border-neutral-700 focus:border-green-500 transition"
                />
              </div>

              {type === "post" && (
                <div className="flex flex-col sm:flex-row gap-4">

                  <div className="flex-1">
                    <label className="text-sm text-neutral-400 block mb-1">
                      Price ($)
                    </label>
                    <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900">
                      <input
                        // type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0) setPrice(val);
                          else if (e.target.value === "") setPrice("");
                        }}
                        className="w-full bg-transparent text-white text-sm px-2 py-2.5 outline-none no-spinner"
                      />
                    </div>
                  </div>


                  <div className="flex-1">
                    <label className="text-sm text-neutral-400 block mb-1">
                      Quantity
                    </label>
                    <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((prev) =>
                            Math.max(0, parseInt((prev as string) || "0") - 1)
                          )
                        }
                        className="px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors duration-150 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        inputMode="numeric"
                        min="0"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 0) setQuantity(val);
                          else if (e.target.value === "") setQuantity("");
                        }}
                        className="w-full bg-transparent text-white text-sm px-2 py-2 outline-none no-spinner"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(
                            (prev) => parseInt((prev as string) || "0") + 1
                          )
                        }
                        className="px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors duration-150 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
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
                <label className="text-sm text-neutral-400 block">
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
                options={INTERESTS.map((i) => ({
                  label: i.label,
                  value: i.id,
                }))}
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
          )} */}
        </AnimatePresence>
      </PageWrapper>

      <ImageStrip
        start={stripData.start}
        end={stripData.end}
        speed={12}
        className="absolute bottom-0 left-0 opacity-25 w-full h-screen pointer-events-none overflow-hidden"
        imgHeightTW="h-32 sm:h-40 md:h-44"
        imgWidthTW="w-44 sm:w-52 md:w-56"
      />
    </>
  );
}
