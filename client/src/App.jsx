// // STEP 1
// import { useEffect, useState } from "react";

// function App() {
//   const [count, setCount] = useState(0);
//   const [count2, setCount2] = useState(0);

//   //Step 2
//   function counter() {
//     console.log("Counter is called");
//   }

//   useEffect(() => {
//     counter();
//   }, [count, count2]); // depend on count, so it will be called when count changes

//   // counter();

//   return (
//     <div className="app">
//       <h1>useEffect Hook</h1>
//       <p>Count: {count}</p>
//       <button onClick={() => setCount(count + 1)}>Counter</button>
//       <p>Count2: {count2}</p>
//       <button onClick={() => setCount2(count2 + 1)}>Counter2</button>
//     </div>
//   );
// }
// export default App;
import { useState, useEffect } from "react";
import axios from "axios";
const API = "http://localhost:3000";
function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    axios
      .get(`${API}/notes`)
      .then((res) => {
        setNotes(res.data?.notes || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Server not running?");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading notes...</p>;
  if (error) return <p>{error}</p>;
  return (
    <ul>
      {notes.map((n) => (
        <li key={n._id}>{n.title}</li>
      ))}
    </ul>
  );
}

export default App;
