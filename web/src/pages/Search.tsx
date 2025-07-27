import { useEffect, useState, useCallback } from "react";
import { SearchIcon } from "lucide-react";
import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
  where,
  DocumentSnapshot,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth"; // assuming you have this
import PageWrapper from "../components/PageWrapper";
import Masonry from "react-responsive-masonry";
import { motion, AnimatePresence } from "framer-motion";
import InfiniteScroll from "react-infinite-scroll-component";
import type { Post } from "../utils/types";
import PostCard from "../components/PostCard";

export default function Search() {
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const BATCH_SIZE = 16;

  const [loadedImages, setLoadedImages] = useState<number[]>([]);

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchInitialPosts = async () => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("timestamp", "desc"), limit(BATCH_SIZE));
    const snapshot = await getDocs(q);
    const posts: Post[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
    setAllPosts(posts);
    setFilteredPosts(posts);
    setDisplayedPosts(posts);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === BATCH_SIZE);
  };

  const loadMorePosts = async () => {
    if (!hasMore || !lastVisible) return;
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      orderBy("timestamp", "desc"),
      startAfter(lastVisible),
      limit(BATCH_SIZE)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      setHasMore(false);
      return;
    }
    const newPosts: Post[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];

    setAllPosts((prev) => [...prev, ...newPosts]);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
  };

  const loadMoreFilteredPosts = () => {
    const currentLength = displayedPosts.length;
    const nextSlice = filteredPosts.slice(
      currentLength,
      currentLength + BATCH_SIZE
    );
    setDisplayedPosts((prev) => [...prev, ...nextSlice]);
  };

  const fetchSavedPosts = useCallback(async () => {
    if (!user) return;

    // 1. Get the savedPosts subcollection
    const savedPostsRef = collection(db, "users", user.uid, "saves");
    const savedSnapshot = await getDocs(savedPostsRef);

    if (savedSnapshot.empty) return;

    // 2. Extract post IDs (each doc ID is a saved post ID)
    const savedIds = savedSnapshot.docs.map((doc) => doc.id).slice(0, 10); // Limit to 10 due to Firestore `in` query constraint

    console.log("User saved posts IDs from subcollection:", savedIds);

    // 3. Fetch posts from "posts" collection by ID
    const savedQuery = query(
      collection(db, "posts"),
      where("__name__", "in", savedIds)
    );

    const postSnapshot = await getDocs(savedQuery);
    const posts: Post[] = postSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];

    setSavedPosts(posts);
  }, [user]);

  useEffect(() => {
    fetchInitialPosts();
    fetchSavedPosts();
  }, [fetchSavedPosts, user]);

  useEffect(() => {
    const filtered = allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(debouncedSearchTerm) ||
        post.keywords.some((kw) =>
          kw.toLowerCase().includes(debouncedSearchTerm)
        ) ||
        post.niche.some((n) => n.toLowerCase().includes(debouncedSearchTerm))
    );
    setFilteredPosts(filtered);
    setDisplayedPosts(filtered.slice(0, BATCH_SIZE));
  }, [debouncedSearchTerm, allPosts]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => [...prev, index]);
  };

  const isSearching = debouncedSearchTerm.length > 0;
  const hasMoreItems = isSearching
    ? displayedPosts.length < filteredPosts.length
    : hasMore;

  const handleLoadMore = () => {
    if (isSearching) {
      loadMoreFilteredPosts();
    } else {
      loadMorePosts();
    }
  };

  return (
    <PageWrapper className="min-h-screen w-full">
      <div className="overflow-y-auto max-h-screen p-4">
        <main className="flex-1 flex flex-col p-4 gap-4 w-full max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white"
          >
            Search
          </motion.h1>

          <div>
            <label className="text-2xl text-primary font-semibold flex items-center gap-2">
              <SearchIcon size={28} /> Quick Search
            </label>
            <input
              type="text"
              placeholder="Search by keyword, caption, or niche..."
              className="mt-2 w-full rounded-md bg-muted text-sm px-3 py-2 focus:outline-none focus:ring-2 ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <AnimatePresence>
              {filteredPosts.length === 0 && isSearching ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-muted-foreground"
                >
                  No posts found.
                </motion.p>
              ) : (
                <InfiniteScroll
                  dataLength={displayedPosts.length}
                  next={handleLoadMore}
                  hasMore={hasMoreItems}
                  loader={
                    <p className="text-muted-foreground text-center mt-4">
                      Loading more...
                    </p>
                  }
                >
                  <Masonry columnsCount={3} gutter="1rem">
                    {displayedPosts.map((post, i) => (
                      <PostCard
                        key={`${post.id}-${i}`}
                        post={post}
                        index={i}
                        userSavedPosts={savedPosts.map((p) => p.id)}
                        isLoaded={loadedImages.includes(i)}
                        onImageLoad={() => handleImageLoad(i)}
                      />
                    ))}
                  </Masonry>
                </InfiniteScroll>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}
