// Each selected option controls one part of this reusable house illustration.
const HousePreview = ({ selections = {}, thumbnail = false }) => {
  const siding = selections.Siding?.preview || {
    color: "#F3EEE4",
    variant: "lap",
  };
  const roof = selections.Roof?.preview || {
    color: "#3D4148",
    variant: "shingle",
  };
  const door = selections["Front Door"]?.preview || {
    color: "#FAF8F2",
    variant: "panel",
  };
  const windows = selections["Window Frames"]?.preview || {
    color: "#F7F5F0",
    variant: "standard",
  };
  const garden = selections.Landscaping?.preview || {
    color: "#567547",
    variant: "shrubs",
  };

  return (
    <svg
      viewBox="0 0 640 420"
      role={thumbnail ? undefined : "img"}
      aria-hidden={thumbnail || undefined}
      aria-label={
        thumbnail
          ? undefined
          : "House illustration showing your selected exterior finishes"
      }
    >
      <rect width="640" height="420" fill="#EAF0EF" />
      <circle cx="536" cy="65" r="30" fill="#F9E7AF" />
      <path
        d="M0 300 Q150 240 320 300 Q480 260 640 295 V420 H0Z"
        fill="#CDDCC9"
      />
      <ellipse cx="320" cy="365" rx="245" ry="23" fill="#B7C7B1" />
      <rect
        x="100"
        y="195"
        width="440"
        height="155"
        rx="2"
        fill={siding.color}
        stroke="#7C8078"
        strokeWidth="2"
      />
      {[215, 235, 255, 275, 295, 315, 335].map((y) => (
        <path
          key={y}
          d={`M102 ${y} H538`}
          stroke="#555"
          strokeOpacity={siding.variant === "wood" ? ".25" : ".12"}
        />
      ))}
      <rect x="445" y="100" width="30" height="65" fill="#937968" />
      <path
        d="M70 200 L320 65 L570 200Z"
        fill={roof.color}
        stroke="#333C3D"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {roof.variant === "standing-seam"
        ? [140, 200, 260, 320, 380, 440, 500].map((x) => (
            <path
              key={x}
              d={`M320 68 L${x} 196`}
              stroke="#FFF"
              strokeOpacity=".2"
              strokeWidth="2"
            />
          ))
        : [110, 135, 160, 185].map((y, i) => (
            <path
              key={y}
              d={`M${240 - i * 45} ${y} H${400 + i * 45}`}
              stroke="#FFF"
              strokeOpacity=".15"
            />
          ))}
      <path d="M88 202 H552" stroke="#FAF7EF" strokeWidth="8" />
      {[145, 405].map((x) => (
        <g key={x}>
          <rect
            x={x}
            y="230"
            width="88"
            height="75"
            fill="#B5CED0"
            stroke={windows.color}
            strokeWidth="9"
          />
          <path
            d={`M${x + 44} 231 V304`}
            stroke={windows.color}
            strokeWidth="5"
          />
          {windows.variant === "gridded" && (
            <path
              d={`M${x} 266 H${x + 88}`}
              stroke={windows.color}
              strokeWidth="5"
            />
          )}
          <path
            d={`M${x + 8} 242 L${x + 28} 242 L${x + 8} 272Z`}
            fill="#FFF"
            opacity=".3"
          />
        </g>
      ))}
      <rect
        x="284"
        y="233"
        width="72"
        height="117"
        fill={door.color}
        stroke="#F7F3EA"
        strokeWidth="8"
      />
      {door.variant === "glass-insert" ? (
        <rect x="311" y="246" width="18" height="76" fill="#B5CED0" />
      ) : (
        <>
          <rect
            x="295"
            y="247"
            width="50"
            height="40"
            fill="none"
            stroke="#555"
            strokeOpacity=".3"
          />
          <rect
            x="295"
            y="297"
            width="50"
            height="40"
            fill="none"
            stroke="#555"
            strokeOpacity=".3"
          />
        </>
      )}
      <circle cx="341" cy="295" r="3" fill="#C6A269" />
      <path d="M279 352 H361 L390 420 H250Z" fill="#E3DED2" />
      <rect x="269" y="348" width="102" height="9" rx="2" fill="#AAA99F" />
      <g fill={garden.color}>
        {[132, 180, 226, 414, 461, 511].map((x, i) => (
          <g key={x}>
            {garden.variant === "meadow" ? (
              <path
                d={`M${x - 15} 350 Q${x - 24} 313 ${x - 8} 309 L${x} 342 L${x + 8} 301 Q${x + 25} 314 ${x + 15} 350Z`}
              />
            ) : (
              <ellipse
                cx={x}
                cy={garden.variant === "formal" ? 327 : 340}
                rx="26"
                ry={garden.variant === "formal" ? 30 : 18}
              />
            )}
            {garden.variant === "flowers" && (
              <>
                <circle
                  cx={x - 9}
                  cy="328"
                  r="7"
                  fill={i % 2 ? "#E8B451" : "#D985A9"}
                />
                <circle cx={x + 8} cy="336" r="6" fill="#F3D397" />
              </>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
};

export default HousePreview;
