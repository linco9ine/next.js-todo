import React from "react";
import styles from "./InternalServerError.module.css";
import { useRouter } from "next/router";


export default function InternalServerError({route}) {

  const router = useRouter();
  return (
    <div className={styles.container}>
      <h1 className={styles.code}>500</h1>
      <p className={styles.title}>Internal Server Error</p>
      <p className={styles.subtitle}>Oops! Something went wrong on our end.</p>
      <button className={styles.button} onClick={() => route? router.push(route) : window.location.reload()}>
        Try Again
      </button>
    </div>
  );
}

