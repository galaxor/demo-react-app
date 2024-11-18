export default {
  loggedInUser: () => {
    return JSON.parse(window.localStorage.getItem('user'));
  },

  login: () => {
    const user = { name: 'Cool User' };
    window.localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    window.localStorage.removeItem('user');
    return null;
  }
};
