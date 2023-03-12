import "./signup.css";

function App() {
  return (
    <div className="App">
      <center>
        {" "}
        <h1 className="head"> AVISHKAR </h1>{" "}
      </center>
      <div class="center">
        <h1>SignUp</h1>
        <form method="post">
          <div class="txt_field">
            <input type="text" required />
            <span></span>
            <label>Username</label>
          </div>
          <div class="txt_field">
            <input type="email" required />
            <span></span>
            <label>Email</label>
          </div>
          <div class="txt_field">
            <input type="password" required />
            <span></span>
            <label>Password</label>
          </div>
          <input type="submit" value="Signup" />
        </form>
      </div>
    </div>
  );
}

export default App;
