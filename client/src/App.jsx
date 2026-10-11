import React, { useEffect, useState } from "react";

const App = () => {
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    (() => {
      fetch("/estates")
        .then((res) => {
          if (!res.ok) throw new Error("request failed");
          return res.text();
        })
        .then((data) => setGreeting(data))
        .catch((error) => console.log(error));
    })();
  }, []);
  return <div>{greeting}</div>;
};

export default App;
