function Button({ onClick }) {
  return <button onClick={() => onClick("Hello from child!")}>Click me</button>;
}

export default Button;
