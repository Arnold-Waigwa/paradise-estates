import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./App.module.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HomeCard from "../components/HomeCard";

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
        console.error("Error fetching homes", error);
        setError("Error fetching homes");
      } finally {
        setIsLoading(false);
      }
    };
    getHomes();
  }, []);

  const updateSearch = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("q", value);
    else params.delete("q");
    setSearchParams(params, { replace: true });
  };
  const query = search.trim().toLowerCase();
  const filteredHomes = homes.filter(home =>
    `${home.name} ${home.description}`.toLowerCase().includes(query),
  );

  return (
    <div>
      <Navbar search={search} onSearchChange={updateSearch} />
      <Hero />
        {!isLoading && !error && search.trim() && (
          <p role="status" style={{ padding: "16px 0" }}>
            {filteredHomes.length} {filteredHomes.length === 1 ? "home" : "homes"} found for “{search.trim()}”.
            <button type="button" onClick={() => updateSearch("")} style={{ marginLeft: 12, textDecoration: "underline" }}>Clear search</button>
          </p>
        )}
      {isLoading && <p>loading...</p>}
      {error && <p>Unable to get homes...</p>}
      <ul className={styles.cardContainer}>
        {filteredHomes.map((home) => (
          <HomeCard key={home.id} home={home} />
        ))}
      </ul>
    </div>
  );
};

export default App;
