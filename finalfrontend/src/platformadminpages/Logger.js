import React, { useState } from "react";
function Logger() {
  const [activeItem, setActiveItem] = useState(null);

  const handleItemClick = (item) => {
    if (item !== activeItem) {
      setActiveItem(item);
    } else {
      setActiveItem(null);
    }
  };

  const contentMap = {
    "Node Manager": (
      <p>
        This is the content for Node Manager. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Sed euismod, urna sed congue blandit, massa
        ipsum molestie mi, a sollicitudin mauris justo vel ante. Sed eget nisi
        auctor, maximus enim ac, vehicula tellus. Morbi sit amet elit congue,
        placerat felis ut, tristique sapien.
      </p>
    ),
  };

  const tableContent = Object.keys(contentMap).map((item) => (
    <tr
      key={item}
      onClick={() => handleItemClick(item)}
      className={item === activeItem ? "active" : ""}
    >
      <td>{item}</td>
    </tr>
  ));

  return (
    <div>
      <li
        className="list-group-item d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer" }}
      >
        {tableContent}
        <span className="badge bg-success rounded-pill">OK</span>
      </li>
      {activeItem && contentMap[activeItem]}
    </div>
  );
}

export default Logger;
