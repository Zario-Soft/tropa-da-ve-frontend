import React from 'react'
import { useRouteError } from "react-router-dom";
import styles from './routes.css';

export default function ErrorPage() {
  let error = useRouteError();
  console.error(error);

  return (
    <div className={styles.main}>
      
      <h1>Ops!</h1>
      <p>Página não encontrada!</p>
    </div>
  );
}