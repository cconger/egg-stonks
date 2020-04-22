import * as React from 'react';

import {ErrorMsg} from 'stonks/game/client';

import './style.css';

export interface ErrorPaneProps {
  error: ErrorMsg;
}

type ErrorPaneState = ErrorMsg[]

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

  const handle = () => {
    for (let i = 0; i < errorList.length; i++) {
      if (!errorList[i].Persist) {
        setErrorList([...errorList.slice(0,i), ...errorList.slice(i+1)])
      }
    }
  }

  errors = errorList.map((error) => {
    const classNames = ["error"]
    if (error.Persist) {
      classNames.push("persist")
    }
    return (
      <div className={classNames.join(' ')} key={error.ID} onAnimationEnd={handle}>{error.Message}</div>
    );
  })

  return (
    <div className="error-container">
      {errors}
    </div>
  )
}
