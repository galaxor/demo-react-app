import { useContext, useEffect, useState } from 'react';
import DatabaseContext from './DatabaseContext.jsx';

export default function Test({db}) {
  const [nonsense, setNonsense] = useState(<>Loading</>);

  useEffect(() => {
    const openDb = async () => {
      const dbConnection = await db.open();
      const transaction = dbConnection.transaction("people");
      const peopleStore = transaction.objectStore("people");
      const allPeople = peopleStore.getAll();
      allPeople.onsuccess = event => {
        const people = event.target.result;
        setNonsense(<People people={people} />);
      }
    };
    openDb();
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
