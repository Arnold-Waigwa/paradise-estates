import React, { useEffect, useState } from "react";
import styles from "./App.module.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HomeCard from "../components/HomeCard";

const App = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [homes, setHomes] = useState([]);

  useEffect(() => {
    const getHomes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/homes");
        if (!response.ok) throw new Error("Error fetching homes");
        const data = await response.json();
        setHomes(data);
      } catch (error) {
        console.log("Error fetching homes");
        setError("Error fetching homes");
      } finally {
        setIsLoading(false);
      }
    };
    getHomes();
  }, []);

  return (
    <div>
      <Navbar />
      <Hero />
      {isLoading && <p>loading...</p>}
      {error && <p>Unable to get homes...</p>}
      <ul className={styles.cardContainer}>
        {homes.map((home) => (
          <HomeCard key={home.id} home={home} />
        ))}
      </ul>
    </div>
  );
};

export default App;
