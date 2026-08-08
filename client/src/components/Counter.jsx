import { useEffect } from "react";

const Counter = ({ counter1, counter2 }) => {
  const handleCounter1 = () => {
    console.log("handleCounter called", counter1);
  };

  const handleCounter2 = () => {
    console.log("handleCounter2 called", counter2);
  };

  //   handleCounter2();

  useEffect(() => {
    handleCounter1();
    // handleCounter2();
  }, []);

  useEffect(() => {
    handleCounter2();
  }, []);

  return (
    <div>
      <h1>Counter Component</h1>
      <p>Counter1 value: {counter1}</p>
      <p>Counter1 value: {counter2}</p>
    </div>
  );
};

export default Counter;
