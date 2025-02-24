import {useContext} from 'react'

import LanguageContext from '../LanguageContext.jsx'

export default function NumberDisplay({number, compact}) {
  const language = useContext(LanguageContext);
  return Intl.NumberFormat(language, {
      notation: compact? "compact" : "standard",
      maximumFractionDigits: 0
    }).format(number);
}
