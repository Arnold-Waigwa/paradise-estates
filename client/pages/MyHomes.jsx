import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import HousePreview from "../components/HousePreview";
import styles from "./MyHomes.module.css";

const MyHomes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const [homes, setHomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadHomes = async () => {
      try {
        const response = await fetch("/custom-homes", { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load your saved homes. Please try again.");
        const data = await response.json();
        if (!controller.signal.aborted) setHomes(data);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    loadHomes();
    return () => controller.abort();
  }, []);

  const deleteHome = async (home) => {
    setIsDeleting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/custom-homes/${home.id}`, { method: "DELETE" });
      // A design already removed elsewhere can also be removed from this list.
      if (!response.ok && response.status !== 404) throw new Error("Unable to delete this home. Please try again.");
      setHomes(currentHomes => currentHomes.filter(item => item.id !== home.id));
      setDeleteId(null);
      setMessage(`“${home.name}” was deleted.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

const updateSearch = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("q", value);
    else params.delete("q");
    setSearchParams(params, { replace: true });
  };
  const query = search.trim().toLowerCase();
  const filteredHomes = homes.filter(home => {
    let text = `${home.name} ${home.home_name || ""}`;
    for (const option of home.options || []) text += ` ${option.name} ${option.category}`;
    return text.toLowerCase().includes(query);
  });

  return (
    <>
      <Navbar search={search} onSearchChange={updateSearch} />
      <main className={styles.page}>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>YOUR PERSONAL COLLECTION</p><h1>My homes</h1><p>Your ideas, made yours. Revisit a design or give it a fresh look.</p></div>
          <Link className={styles.primary} to="/">Create a home →</Link>
        </header>
        {!isLoading && !error && search.trim() && (
          <p role="status" style={{ padding: "16px 0" }}>
            {filteredHomes.length} {filteredHomes.length === 1 ? "home" : "homes"} found for “{search.trim()}”.
            <button type="button" onClick={() => updateSearch("")} style={{ marginLeft: 12, textDecoration: "underline" }}>Clear search</button>
          </p>
        )}
        {isLoading && <p role="status">Loading your homes…</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {message && <p className={styles.success} role="status">{message}</p>}
        {!isLoading && !error && homes.length === 0 && (
          <div className={styles.empty}><h2>A little room for inspiration</h2><p>You haven’t saved any homes yet. Choose a plan and make it your own.</p><Link className={styles.primary} to="/">Explore homes</Link></div>
        )}
        <div className={styles.grid}>
          {filteredHomes.map(home => {
            const selections = {};
            for (const option of home.options || []) selections[option.category] = option;
            return (
              <article className={styles.card} key={home.id}>
                <HousePreview selections={selections} />
                <div className={styles.content}>
                  <p className={styles.plan}>{home.home_name}</p>
                  <h2>{home.name}</h2>
                  <p className={styles.price}>{Number(home.price).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</p>
                  <dl className={styles.finishes}>
                    {(home.options || []).map(option => <div key={option.id}><dt>{option.category}</dt><dd>{option.name}</dd></div>)}
                  </dl>
                  {deleteId === home.id ? (
                    <div className={styles.confirm}>
                      <p>Delete “{home.name}”? This cannot be undone.</p>
                      <div className={styles.actions}><button type="button" className={styles.danger} disabled={isDeleting} onClick={() => deleteHome(home)}>{isDeleting ? "Deleting…" : "Yes, delete"}</button><button type="button" disabled={isDeleting} onClick={() => setDeleteId(null)}>Keep home</button></div>
                    </div>
                  ) : (
                    <div className={styles.actions}>
                      <Link className={styles.edit} to={`/my-homes/${home.id}/edit`}>Edit design →</Link>
                      <button type="button" className={styles.delete} disabled={isDeleting} onClick={() => { setDeleteId(home.id); setError(""); }} aria-label={`Delete ${home.name}`}>Delete</button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default MyHomes;
