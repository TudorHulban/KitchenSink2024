<script>
  import { req } from "../helpers/network.js";

  let usercode = "tudi";
  let password = "xxx";

  function handleSubmit(event) {
    const bodyFormData = new FormData();
    bodyFormData.set("logincode", usercode);
    bodyFormData.set("password", password);

    req("http://localhost:1323/login", bodyFormData).then(r =>
      console.log("token:", r.token)
    );
  }
</script>

<h5>Login Page</h5>

<form on:submit|preventDefault={handleSubmit}>
  <label>User CODE</label>
  <input type="text" name="logincode" bind:value={usercode} />

  <label>Password</label>
  <input type="password" name="password" bind:value={password} />

  <button type="submit">Login</button>
</form>
