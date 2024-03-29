<script>
  let usercode = "tudi";
  let password = "xxx";
  let isLoading = false;

  export let request;

  const handleSubmit = () => {
    isLoading = true;
    console.log("submit:", usercode);

    const bodyFormData = new FormData();
    bodyFormData.set("logincode", usercode);
    bodyFormData.set("password", password);

    let URL = "http://localhost:1323/login";

    request(URL).then(r => {
      setContext(userContextKey, {
        token: r
      });
      console.log("token:", r);
    });
  };
</script>

<style>
  form {
    background: rgb(23, 125, 184);
    padding: 50px;
    width: 250px;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  label {
    margin: 10px 0;
    align-self: flex-start;
    font-weight: 500;
  }
  input {
    border: none;
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
    transition: all 300ms ease-in-out;
    width: 100%;
  }
  input:focus {
    outline: 0;
    border-bottom: 1px solid #666;
  }
</style>

<form on:submit|preventDefault={handleSubmit}>
  <h1>Login</h1>

  <label>CODE</label>
  <input name="logincode" placeholder="user code" bind:value={usercode} />

  <label>Password</label>
  <input name="password" type="password" bind:value={password} />
  <button type="submit">Log in</button>
  {#if isLoading}Logging in...{:else}Log in 🔒{/if}
</form>
