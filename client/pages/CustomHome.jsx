import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import HousePreview from "../components/HousePreview";
import styles from "./CustomHome.module.css";

const money = (value) =>
  Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const CustomHome = () => {
  const { homeId, customHomeId } = useParams();
  const isEditing = Boolean(customHomeId);
  const [home, setHome] = useState(null);
  const [options, setOptions] = useState([]);
  const [selections, setSelections] = useState({});
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadHome = async () => {
      setIsLoading(true);
      setError("");
      setSavedMessage("");
      setSaveError("");
      try {
        let savedDesign;
        let baseHomeId = homeId;
        if (customHomeId) {
          const savedResponse = await fetch(`/custom-homes/${customHomeId}`, { signal: controller.signal });
          if (!savedResponse.ok) throw new Error("Unable to load this saved design.");
          savedDesign = await savedResponse.json();
          baseHomeId = savedDesign.home_id;
        }
        const [homeResponse, optionsResponse] = await Promise.all([
          fetch(`/homes/${baseHomeId}`, { signal: controller.signal }),
          fetch(`/homes/${baseHomeId}/options`, { signal: controller.signal }),
        ]);
        if (!homeResponse.ok || !optionsResponse.ok) {
          throw new Error(
            homeResponse.status === 404
              ? "This home could not be found."
              : "Unable to load this home. Please try again.",
          );
        }
        const homeData = await homeResponse.json();
        const availableOptions = await optionsResponse.json();
        const selectedHome = Array.isArray(homeData) ? homeData[0] : homeData;
        if (!selectedHome) throw new Error("This home could not be found.");
        if (!availableOptions.length)
          throw new Error("This home has no customization options yet.");
        // Start with the least expensive choice in each category.
        const defaults = {};
        for (const option of availableOptions) {
          if (
            !defaults[option.category] ||
            Number(option.price) < Number(defaults[option.category].price)
          ) {
            defaults[option.category] = option;
          }
        }
        if (controller.signal.aborted) return;
        if (savedDesign) {
          for (const option of savedDesign.options) {
            defaults[option.category] = option;
          }
        }
        setHome(selectedHome);
        setOptions(availableOptions);
        setSelections(defaults);
        setName(savedDesign ? savedDesign.name : `${selectedHome.name} — My Design`);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    loadHome();
    return () => controller.abort();
  }, [homeId, customHomeId]);

  const categories = [];
  for (const option of options) {
    if (!categories.includes(option.category)) categories.push(option.category);
  }
  let upgrades = 0;
  for (const option of Object.values(selections))
    upgrades += Number(option.price);
  const totalPrice = Number(home?.price || 0) + upgrades;

  const chooseOption = (option) => {
    setSelections({ ...selections, [option.category]: option });
    setSavedMessage("");
    setSaveError("");
  };

  const saveHome = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSavedMessage("");
    try {
      const response = await fetch(isEditing ? `/custom-homes/${customHomeId}` : "/custom-homes", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_id: home.id,
          name: name.trim(),
          options: Object.values(selections).map((option) => ({
            optionId: option.id,
          })),
        }),
      });
      if (!response.ok) {
        const message = await response.text();
        let errorMessage = message;
        try {
          errorMessage = JSON.parse(message).error || message;
        } catch {
          /* API may return plain text. */
        }
        throw new Error(
          errorMessage || "Unable to save your home. Please try again.",
        );
      }
      const savedHome = await response.json();
      setSavedMessage(`“${savedHome.name}” was ${isEditing ? "updated" : "saved"} successfully.`);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Link to={isEditing ? "/my-homes" : "/"} className={styles.back}>
          {isEditing ? "← My homes" : "← All homes"}
        </Link>
        {isLoading && <p role="status">Loading your home…</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {!isLoading && !error && home && (
          <>
            <header className={styles.header}>
              <p className={styles.eyebrow}>{isEditing ? "EDIT YOUR DESIGN" : "MAKE IT YOUR OWN"}</p>
              <h1>{home.name}</h1>
              <p>{home.description}</p>
            </header>
            <div className={styles.layout}>
              <section
                className={styles.previewPanel}
                aria-label="Your home preview"
              >
                <div className={styles.preview}>
                  <HousePreview selections={selections} />
                </div>
                <div className={styles.previewCaption}>
                  <h2>Your exterior, your way</h2>
                  <p>Choose a finish to see your illustration change.</p>
                </div>
                <img
                  className={styles.homePhoto}
                  src={home.image}
                  alt={`Exterior inspiration for ${home.name}`}
                />
                <p className={styles.photoCaption}>
                  Original home inspiration · Illustration shows your selected
                  finishes.
                </p>
                <dl className={styles.prices}>
                  <div>
                    <dt>Base home</dt>
                    <dd>{money(home.price)}</dd>
                  </div>
                  <div>
                    <dt>Selected upgrades</dt>
                    <dd>{money(upgrades)}</dd>
                  </div>
                  <div className={styles.total}>
                    <dt>Your total</dt>
                    <dd>{money(totalPrice)}</dd>
                  </div>
                </dl>
              </section>
              <form className={styles.optionsPanel} onSubmit={saveHome}>
                <h2>Choose your finishes</h2>
                <p className={styles.muted}>
                  One choice per feature. Standard finishes are included.
                </p>
                <fieldset disabled={isSaving} className={styles.fields}>
                  {categories.map((category) => (
                    <fieldset key={category} className={styles.category}>
                      <legend>{category}</legend>
                      <div className={styles.optionGrid}>
                        {options
                          .filter((option) => option.category === category)
                          .map((option) => {
                            const selected =
                              selections[category]?.id === option.id;
                            return (
                              <label
                                key={option.id}
                                className={`${styles.optionCard} ${selected ? styles.selected : ""}`}
                              >
                                <input
                                  type="radio"
                                  name={category}
                                  value={option.id}
                                  checked={selected}
                                  onChange={() => chooseOption(option)}
                                />
                                <div className={styles.optionImage}>
                                  <HousePreview
                                    thumbnail
                                    selections={{
                                      ...selections,
                                      [category]: option,
                                    }}
                                  />
                                </div>
                                <div className={styles.optionInfo}>
                                  <span>{option.name}</span>
                                  <strong>
                                    {Number(option.price) === 0
                                      ? "Included"
                                      : `+${money(option.price)}`}
                                  </strong>
                                  <small>{option.description}</small>
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    </fieldset>
                  ))}
                  <div className={styles.saveArea}>
                    <label htmlFor="design-name">Name your home</label>
                    <input
                      id="design-name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setSavedMessage("");
                      }}
                      required
                      maxLength={255}
                      pattern=".*\S.*"
                      placeholder="My dream home"
                    />
                    <button className={styles.saveButton} type="submit">
                      {isSaving
                        ? "Saving…"
                        : `${isEditing ? "Update my home" : "Save my home"} · ${money(totalPrice)}`}
                    </button>
                  </div>
                </fieldset>
                {saveError && (
                  <p className={styles.error} role="alert">
                    {saveError}
                  </p>
                )}
                {savedMessage && (
                  <p className={styles.success} role="status">
                    {savedMessage} <Link to="/my-homes">View my homes →</Link>
                  </p>
                )}
              </form>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default CustomHome;
