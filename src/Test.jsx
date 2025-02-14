import { useContext, useEffect, useState } from 'react';
import DatabaseContext from './DatabaseContext.jsx';
import UserDB from './logic/user.js'

export default function Test({dbConnection}) {
  const [nonsense, setNonsense] = useState(<>Loading</>);

  useEffect(() => {
    (async () => {
      const db = await dbConnection.open();

      const userDB = new UserDB(db);
      const user = await userDB.loggedInUser();

      const sessionId = await userDB.login();

      console.log("User", user, sessionId);

      const transaction = db.db.transaction("people");
      const peopleStore = transaction.objectStore("people");
      const allPeople = peopleStore.getAll();
      allPeople.onsuccess = event => {
        const people = event.target.result;
        setNonsense(<People people={people} />);
      }
    })();
  }, []);

  return nonsense;
}

function People({people}) {
  return (
    <ul>
    {people.map(person => <Person key={person.handle} person={person} />)}
    </ul>
  );
}

function Person({person}) {
  return <li>{person.displayName} ({person.handle})</li>;
}
