import * as React from 'react';
import { useAppDispatch } from '../hooks/redux';
import { setTargetSQL } from '../actions/nl2sql';

import { SQLQuerySelected } from '../actions/logging';

// const colormap = {
//   sql: {

//   },
//   sources: {
//     'T5 #1': 'teal'
//   }
// }

export default function FormalQueryList(props) {
  const dispatch = useAppDispatch();

  const onSelectionChange = (value, loggingInfo, schema) => {
    dispatch(setTargetSQL(value));
    loggingInfo(SQLQuerySelected, value, schema, props.array);
  };
  const count = 0;
  return (
    <React.Fragment>
      <div className="ui top attached label teal">
        {props.array && props.array.length > 0 ? (
          'Generated SQL Queries'
        ) : (
          <em>Generated SQL Queries will appear here</em>
        )}
      </div>
      {props.isLoading ? (
        <div className="ui active inverted dimmer">
          <div className="ui text loader">Generating Queries</div>
        </div>
      ) : (
        props.array.length > 0 && (
          <div className="ui fluid vertical menu">
            {props.array.map(({ sql, source }, i) => (
              <a
                className="ui item"
                key={i}
                onClick={() => {
                  onSelectionChange(sql, props.loggingInfo, props.schema);
                }}>
                {source.length > 0 && <span className="ui label teal">{source}</span>}
                <div>{sql}</div>
              </a>
            ))}
          </div>
        )
      )}
    </React.Fragment>
  );
}
