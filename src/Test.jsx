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
        console.log(people);
        setNonsense(<>Loaded!</>);
      }
    };
    openDb();
  }, []);

  return nonsense;
}
