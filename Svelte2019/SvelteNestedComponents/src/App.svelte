<script>
  import { onMount, setContext } from "svelte";
  import {
    key as userContextKey,
    initialValue as userContextInitialValue
  } from "./userContext";
  import C1 from "./C1.svelte";
  import Login from "./Login.svelte";
  export let name;
  export let thevars;

  onMount(() => {
    setContext(userContextKey, userContextInitialValue);
  });

  // AJAX
  const request = async (pURL, pMethod = "POST") => {
    const resp = await fetch(pURL, {
      method: pMethod,
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: bodyFormData
    });
    const json = await resp.json();
    //console.log("json:", json.token);
    return json.token;
  };
</script>

<style>
  h1 {
    margin: 10px 20px 30px 20px;
    font-size: 40px;
  }
</style>

<h1>Hi {name}!</h1>
<Login />
<C1 v1={thevars.v2} />
