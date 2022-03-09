import * as React from 'react';
import { useAppDispatch } from '../hooks/redux';
import { setTargetSQL } from '../actions/nl2sql';

export default function FormalQueryList(props) {
  const dispatch = useAppDispatch();

  const onSelectionChange = (value) => {
    dispatch(setTargetSQL(value));
  };

  const count = 0;
  return (
    <div className="ui form">
      <div className="grouped fields">
        {props.array && props.array.length > 0 ? (
          <div className="ui small header" id="demo-radio-buttons-group-label">
            Generated SQL Queries
          </div>
        ) : (
          <div className="ui grey tiny header" id="demo-radio-buttons-group-label">
            <em>Generated SQL Queries will appear here</em>
          </div>
        )}

        {props.isLoading ? (
          <div className="ui active inverted dimmer">
            <div className="ui text loader">Generating Queries</div>
          </div>
        ) : (
          props.array.map((sqlValue, i) => (
            <div className="field" key={i}>
              <div
                className="ui radio checkbox"
                onClick={() => {
                  onSelectionChange(sqlValue);
                }}>
                <input
                  type="radio"
                  name={'option_' + i}
                  checked={sqlValue == props.selected}
                  className="hidden"
                />
                <label>{sqlValue}</label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
