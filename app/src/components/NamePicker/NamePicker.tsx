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
    <div className="NamePicker">
      <label>Name</label>
      <input type="text" minLength={1} maxLength={12} value={name} onChange={updateName} />
      <div onClick={submit}>Join</div>
    </div>
  )
}
