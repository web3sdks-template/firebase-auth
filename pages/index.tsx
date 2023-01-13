import { ConnectWallet, useAddress, useSDK } from "@web3sdks/react";
import { signInWithCustomToken, signOut } from "firebase/auth";
import React from "react";
import initializeFirebaseClient from "../lib/initFirebase";
import { getDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import styles from "../styles/Home.module.css";
import useFirebaseUser from "../lib/useFirebaseUser";
import useFirebaseDocument from "../lib/useFirebaseUserDocument";

export default function Login() {
  const address = useAddress();
  const sdk = useSDK();
  const { auth, db } = initializeFirebaseClient();
  const { user, isLoading: loadingAuth } = useFirebaseUser();
  const { document, isLoading: loadingDocument } = useFirebaseDocument();

  async function signIn() {
    // Use the same address as the one specified in _app.tsx.
    const payload = await sdk?.auth.login("example.com");

    // Make a request to the API with the payload.
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });

    // Get the returned JWT token to use it to sign in with
    const { token } = await res.json();

    // Sign in with the token.
    signInWithCustomToken(auth, token)
      .then((userCredential) => {
        // On success, we have access to the user object.
        const user = userCredential.user;

        // If this is a new user, we create a new document in the database.
        const usersRef = doc(db, "users", user.uid!);
        getDoc(usersRef).then((doc) => {
          if (!doc.exists()) {
            // User now has permission to update their own document outlined in the Firestore rules.
            setDoc(usersRef, { createdAt: serverTimestamp() }, { merge: true });
          }
        });               
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.iconContainer}>
          <img
            className={styles.icon}
            src={"/web3sdks.png"}
            alt="web3sdks icon"
          />
          <img
            className={styles.icon}
            src={"/firebase.png"}
            alt="firebase icon"
          />
        </div>

        <h1 className={styles.h1}>web3sdks + Firebase</h1>

        <p className={styles.explain}>
          By clicking the button below, you authenticate with your wallet.
        </p>
        <p className={styles.explain}>
          You will have a user created for you in Firebase Auth and a document
          created for you in Firestore.
        </p>

        {address ? (
          <div>
            {!user ? (
              <button onClick={() => signIn()} className={styles.mainButton}>
                Sign in with Ethereum
              </button>
            ) : (
              <button
                onClick={() => signOut(auth)}
                className={styles.mainButton}
              >
                Sign Out
              </button>
            )}

            <hr className={styles.divider} />

            <h2>Current Firebase Information</h2>

            <p>
              <b>User ID: </b>
              {loadingAuth ? "Loading..." : user?.uid || "Not logged in"}
            </p>

            <p>
              <b>Document ID: </b>
              {loadingDocument ? "Loading..." : document?.id || "No document"}
            </p>
          </div>
        ) : (
          <ConnectWallet />
        )}
      </div>
    </div>
  );
}
