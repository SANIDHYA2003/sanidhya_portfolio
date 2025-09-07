import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css"; // we'll add CSS separately

function Badges() {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data } = await axios.get("/api/badge");
        setBadges(data);
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchBadges();
  }, []);

  return (
    <div className="badges-section">
      
      <div className="badges-row">
        {badges.map((badge) => (
          <img
            key={badge._id}
            src={badge.imageUrl}
            alt={badge.name}
            className="badge-img"
            title={badge.name}
          />
        ))}
      </div>
    </div>
  );
}

export default Badges;
