"use client";

function TimelineDropdownItem({ icon, label, onClick }) {
  return (
    <li className="_feed_timeline_dropdown_item">
      {onClick ? (
        <button
          onClick={onClick}
          className="_feed_timeline_dropdown_link"
          style={{
            background: "none",
            border: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <span>{icon}</span>
          {label}
        </button>
      ) : (
        <a href="#0" className="_feed_timeline_dropdown_link">
          <span>{icon}</span>
          {label}
        </a>
      )}
    </li>
  );
}

export default TimelineDropdownItem;
