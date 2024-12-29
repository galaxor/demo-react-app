import { useMemo, useState } from 'react'

function expensive() {
  console.log("Expensive operation");
  return "Expensive operation";
}

export default function Test() {
  const nothingImportantInitial = useMemo(expensive, []);

  const [nothingImportant, setNothingImportant] = useState(nothingImportantInitial);

  return (<>
    <p>{nothingImportant? nothingImportant.toString() : ""}</p>

    <button onClick={e => setNothingImportant("cheap operation")}>Press</button>
  </>);
}
