import * as React from 'react';

import {ErrorMsg} from 'stonks/game/client';

import './style.css';

export interface ErrorPaneProps {
  error: ErrorMsg;
}

type ErrorPaneState = ErrorMsg[]

export interface Error {
  ID: string;
  Message: string;
}

export const ErrorPane = (props: ErrorPaneProps) => {
  const [errorList, setErrorList] = React.useState<ErrorPaneState>([])

  React.useEffect(() => {
    if (props.error) {
      setErrorList([...errorList, props.error])
    }
  }, [props.error])

  let errors
  if (!errorList || errorList.length === 0) {
    errors = null
  }

  console.log("errorList", errorList)

  let error = errorList[0];
  const handle = () => {
    setErrorList(errorList.slice(1));
  }

  errors = errorList.map((error) => {
    return (
      <div className="error" key={error.ID} onAnimationEnd={handle}>{error.Message}</div>
    );
  })

  return (
    <div className="error-container">
      {errors}
    </div>
  )
}
