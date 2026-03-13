import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyABHGoUomcLIuj48Z6dX2ODYa1Okxrfg8Q",
  authDomain: "fir-auth-backend-49062.firebaseapp.com",
  projectId: "fir-auth-backend-49062",
  appId: "1:757466697633:web:0978e056c2147a971885e0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
