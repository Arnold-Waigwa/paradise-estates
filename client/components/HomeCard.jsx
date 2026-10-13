import React from "react";
import styles from "./HomeCard.module.css";

const HomeCard = ({ home: { name, description, price, image } }) => {
  return (
    <article className={styles.article}>
      <img
        className={styles.image}
        src={image}
        alt={`Exterior of ${name}`}
        loading="lazy"
      />

      {/* 💡 Spacing container element added here */}
      <div className={styles.cardContent}>
        <h3 className={styles.heading}>{name}</h3>
        <p className={styles.description}>{description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>${price.toLocaleString()}</span>
          <span className={styles.actionText}>View details &rarr;</span>
        </div>
      </div>
    </article>
  );
};

export default HomeCard;
