import { useContext, useEffect, useState } from 'react';
import DatabaseContext from './DatabaseContext.jsx';

export default function Test() {
  const dbPromise = useContext(DatabaseContext);
  console.log(dbPromise);

  const [nonsense, setNonsense] = useState(<>Loading</>);

  useEffect(() => {
    console.log(dbPromise.open());

    dbPromise.open().then(db => {
      console.log("setting nonsense");
      setNonsense(<>Loaded!</>);
    });

    openDb();
  }, []);

  return nonsense;
}
