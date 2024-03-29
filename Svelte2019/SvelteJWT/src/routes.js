import Landing from './views/landing.svelte';
import Login from './views/login.svelte';
import Admin from './views/authorized.svelte';

function userIsAdmin() {
  return false;
}

const routes = [
  {
    name: '/',
    component: Landing
  },
  {
    name: 'login',
    component: Login
  },
  {
    name: 'admin',
    component: Admin,
    onlyIf: {
      guard: userIsAdmin,
      redirect: '/login'
    }
  }
];
export { routes };
