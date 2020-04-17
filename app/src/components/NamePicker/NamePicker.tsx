import * as React from 'react';

import './style.css';

export interface NamePickerProps {
  prefill: string | null;
  onSubmit: (name: string) => void;
}

export const NamePicker = (props: NamePickerProps) => {
  let [name, setName] = React.useState(props.prefill === null ? "" : props.prefill)
  let updateName = (event: React.FormEvent<HTMLInputElement>) => {
    setName((event.target as HTMLInputElement).value)
  }

  const submit = () => {
    props.onSubmit(name);
  }

  return (
    <div className="dialog-container">
      <div className="dialog">
        <div className="NamePicker">
          <label>Name:
            <input className="name-input" type="text" minLength={1} maxLength={12} value={name} onChange={updateName} />
          </label>
          <div className="name-button" onClick={submit}>JOIN</div>
        </div>
      </div>
    </div>
  )
}
