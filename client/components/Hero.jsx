import React from "react";
import styles from "./Hero.module.css";

const Hero = () => {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        Design the home you want all at one place
      </header>
      <div className={styles.description}>
        Build your custom home without the hassle of tireless interview and
        visits. Here, you get realistic views of how your bespoke home will look
        like!
      </div>
    </section>
  );
};

export default Hero;
