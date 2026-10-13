import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = ({ search, onSearchChange }) => {
  const navigate = useNavigate();
  const submitSearch = (event) => {
    event.preventDefault();
    if (onSearchChange) return;
    const query = new FormData(event.currentTarget).get("q").trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
  };
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        Home
      </Link>

      <form className={styles.searchContainer} role="search" onSubmit={submitSearch}>
        <svg
          className={styles.searchIcon}
          xmlns="http://w3.org"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          name="q"
          aria-label="Search homes"
          value={search}
          onChange={onSearchChange ? event => onSearchChange(event.target.value) : undefined}
          className={styles.searchInput}
          placeholder="Search homes..."
        />
      </form>

      {/* Profile/Right Item */}
      <Link to="/my-homes" className={styles.navLink}>My Homes</Link>
    </nav>
  );
};

export default Navbar;
