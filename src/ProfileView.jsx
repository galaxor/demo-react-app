import { useContext } from 'react';
import { useLoaderData } from "react-router-dom";

import DatabaseContext from './DatabaseContext.jsx';
import People from './logic/people.js';

export function getPersonLoader(db) {
  return ({params}) => {
    const peopleDB = new People(db);

    console.log(params);

    const person = peopleDB.get(params.handle);

    return { person };
  };
}

export function ProfileView({handle}) {
  const { person } = useLoaderData();

  return JSON.stringify(person);
}
