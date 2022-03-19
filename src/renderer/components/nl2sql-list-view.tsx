import * as React from 'react';
import { useAppDispatch } from '../hooks/redux';
import { setTargetSQL } from '../actions/nl2sql';

// const colormap = {
//   sql: {

//   },
//   sources: {
//     'T5 #1': 'teal'
//   }
// }

export default function FormalQueryList(props) {
  const dispatch = useAppDispatch();

  const onSelectionChange = (value) => {
    dispatch(setTargetSQL(value));
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
        <div className="ui fluid vertical menu">
          {props.array.map(({ sql, source }, i) => (
            <a
              className="ui item"
              key={i}
              onClick={() => {
                onSelectionChange(sql);
              }}>
              {source.length > 0 && <span className="ui label teal">{source}</span>}
              <div>{sql}</div>
            </a>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}
