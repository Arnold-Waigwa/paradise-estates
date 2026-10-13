import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        Home
      </Link>

      <div className={styles.searchContainer}>
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
          className={styles.searchInput}
          placeholder="Search homes..."
        />
      </div>

      {/* Profile/Right Item */}
      <div className={styles.navLink}>My Homes</div>
    </nav>
  );
};

export default Navbar;
