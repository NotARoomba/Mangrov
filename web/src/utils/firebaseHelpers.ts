import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Post } from "./types";

/**
 * Checks if a username already exists in the database
 * @param username - The username to check
 * @param excludeUserId - Optional user ID to exclude from the check (for updates)
 * @returns Promise<boolean> - True if username exists, false otherwise
 */
export const checkUsernameExists = async (
  username: string,
  excludeUserId?: string
): Promise<boolean> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    
    if (excludeUserId) {
      // For updates, exclude the current user's document
      return querySnapshot.docs.some(doc => doc.id !== excludeUserId);
    }
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking username existence:", error);
    return false;
  }
};

/**
 * Fetches user data by user ID
 * @param userId - The user ID to fetch data for
 * @returns Promise with user data or null if not found
 */
export const fetchUserData = async (userId: string) => {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

/**
 * Fetches user data by username
 * @param username - The username to fetch data for
 * @returns Promise with user data or null if not found
 */
export const fetchUserByUsername = async (username: string) => {
  try {
    const usersQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const usersSnap = await getDocs(usersQuery);
    
    if (!usersSnap.empty) {
      const userDoc = usersSnap.docs[0];
      return { uid: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return null;
  }
};

/**
 * Fetches user's trades by user ID
 * @param userId - The user ID to fetch trades for
 * @returns Promise with array of trades
 */
export const fetchUserTrades = async (userId: string): Promise<Post[]> => {
  try {
    const tradesQuery = query(
      collection(db, "trades"),
      where("uid", "==", userId)
    );
    const tradesSnap = await getDocs(tradesQuery);
    return tradesSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Post))
      .filter((trade) => trade.isAvailable !== false); // Only show available trades
  } catch (error) {
    console.error("Error fetching user trades:", error);
    return [];
  }
};

/**
 * Fetches user's saved posts by user ID
 * @param userId - The user ID to fetch saved posts for
 * @returns Promise with array of saved posts
 */
export const fetchSavedPosts = async (userId: string) => {
  try {
    // Fetch from the 'saves' subcollection where each document ID is a post ID
    const savesQuery = query(collection(db, "users", userId, "saves"));
    const savesSnap = await getDocs(savesQuery);
    const savedPostIds = savesSnap.docs.map((doc) => doc.id);
    
    if (savedPostIds.length === 0) return [];
    
    // Fetch the actual post data from the 'posts' collection
    const savedPostsQuery = query(
      collection(db, "posts"),
      where("__name__", "in", savedPostIds)
    );
    const savedPostsSnap = await getDocs(savedPostsQuery);
    return savedPostsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }
}; 