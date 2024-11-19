class Database {
  constructor() {
    if (localStorage.getItem('accounts') == null) {
      // Initializing the database.
      this.accounts = {
        'testuser': {
          handle: 'testuser@local',
        },
      };

      this.sessions = {
      };

      this.people = {
        'testuser@local': {
          localUserId: 'testuser',
          handle: 'testuser@local',

          displayName: 'Cool User',
          avatar: null,
        },
      };

      this.profiles = {
        'testuser@local': {
          bio: "I am a cool person.",
        },
      };

      localStorage.setItem('accounts', JSON.stringify(this.accounts));
      localStorage.setItem('sessions', JSON.stringify(this.sessions));
      localStorage.setItem('people', JSON.stringify(this.people));
      localStorage.setItem('profiles', JSON.stringify(this.profiles));
    }
  }

  get(table, key) {
    return this[table][key];
  }

  set(table, key, value) {
    this[table][key] = value;
    localStorage.setItem(table, JSON.stringify(this[table]));
    return value;
  }

  del(table, key) {
    delete this[table][key];
    localStorage.setItem(table, JSON.stringify(this[table]));
  }

  clearAll() {
    localStorage.removeItem('accounts');
    localStorage.removeItem('sessions');
    localStorage.removeItem('people');
    localStorage.removeItem('profiles');
  }
}

export default Database;
