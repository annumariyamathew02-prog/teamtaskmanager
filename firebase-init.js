// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAleswM8inHG8pJflvF60Na4Sh5SR0nv7l",  // ONLY the NEW restricted key
  authDomain: "algonive-taskmanager.firebaseapp.com",
  projectId: "algonive-taskmanager",
  storageBucket: "algonive-taskmanager.firebasestorage.app",
  messagingSenderId: "1008372776156",
  appId: "1:1008372776156:web:75ac6a3c805c516f950819",
  measurementId: "G-NXL997BHQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create a global Firebase object with all the methods we need
window.FirebaseApp = {
  auth: {
    signIn: async (email, password) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      }
    },
    signUp: async (email, password) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create a user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return userCredential;
      } catch (error) {
        console.error('Sign up error:', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    },
    onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
    currentUser: () => auth.currentUser
  },
  firestore: {
    collection: (path) => collection(db, path),
    addDoc: async (path, data) => {
      try {
        const docRef = await addDoc(collection(db, path), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userId: auth.currentUser?.uid
        });
        return docRef;
      } catch (error) {
        console.error('Error adding document:', error);
        throw error;
      }
    },
    updateDoc: async (path, data) => {
      try {
        await updateDoc(doc(db, path), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating document:', error);
        throw error;
      }
    },
    deleteDoc: async (path) => {
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    },
    getDoc: async (path) => {
      try {
        const docSnap = await getDoc(doc(db, path));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
      } catch (error) {
        console.error('Error getting document:', error);
        throw error;
      }
    },
    doc: (path) => doc(db, path),
    query: (ref, ...queryConstraints) => query(ref, ...queryConstraints),
    where: (field, op, value) => where(field, op, value),
    orderBy: (field, direction) => orderBy(field, direction || 'asc'),
    onSnapshot: (q, onNext, onError) => onSnapshot(q, onNext, onError),
    serverTimestamp: () => serverTimestamp()
  }
};

// Notify when Firebase is ready
document.dispatchEvent(new CustomEvent('firebase-ready', { 
  detail: { 
    auth: window.FirebaseApp.auth,
    firestore: window.FirebaseApp.firestore 
  } 
}));
