import React from "react";
import "./aboutus.css";

function AboutUs() {
  const persons = [
    {
      name: "HARSHIT KASHYAP",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "2022201050",
      branch: "Mtech-CSE",
    },
    {
      name: "YASH PATHAK",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "2022201011",
      branch: "Mtech-CSE",
    },
    {
      name: "HARSIMRAN",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "r638r634",
      branch: "Mtech-CSE",
    },
    {
      name: "PRIYANK MAHOUR",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "2022201047",
      branch: "Mtech-CSE",
    },
    {
      name: "JATIN SHARMA",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "2022201023",
      branch: "Mtech-CSE",
    },
    {
      name: "UJJWAL PRASKASH",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "2022202009",
      branch: "Mtech-CSIS",
    },
    {
      name: "DISHANT SHARMA",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "32328278",
      branch: "Mtech-CSE",
    },
    {
      name: "Prashant Kumar",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "2022201058",
      branch: "Mtech-CSE",
    },
    {
      name: "Rishabh Gupta",
      imgUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4BiN7nTQEK4W6oJkxig1wRUX1ZY3m250IIFKVxQS3XQ&s",
      rollNo: "2022201011",
      branch: "Mtech-CSIS",
    },
    {
      name: "VIKRAM RAJ BAKSHI",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "493783586",
      branch: "Mtech-CSE",
    },
    {
      name: "",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "",
      branch: "",
    },
    {
      name: "",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "",
      branch: "",
    },
    {
      name: "",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "",
      branch: "",
    },
    {
      name: "",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "",
      branch: "",
    },
    {
      name: "",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "",
      branch: "",
    },
    {
      name: "",
      imgUrl: "https://img.freepik.com/free-icon/user_318-159711.jpg",
      rollNo: "",
      branch: "",
    },
  ];

  const data = persons.map((p, index) => {
    return (
      <div className="flip-card mt-3 ml-5">
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <img
              src={p.imgUrl}
              alt="Avatar"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
          <div className="flip-card-back">
            <h4 className="mt-4">{p.name}</h4>
            <h6>{p.rollNo}</h6>
            <p>{p.branch}</p>
            <p>IIIT-Hyderabad</p>
          </div>
        </div>
      </div>
    );
  });
  return (
    <div>
      <main className="mt-5 pt-3">
        <div className="container-fluid">
          <div className="row">{data}</div>
        </div>
      </main>
    </div>
  );
}
export default AboutUs;
