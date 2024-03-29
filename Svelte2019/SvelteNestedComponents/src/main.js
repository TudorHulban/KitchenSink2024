import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    thevars: {
      v1: 'v1111',
      v2: 'v2222'
    },
    name: 'world'
  }
});

export default app;
