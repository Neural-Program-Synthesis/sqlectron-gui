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

  let content;
  let label;

  if (props.isLoading) {
    label = 'SQL query suggestions will appear here.';
    content = (
      <div className="ui active inverted dimmer">
        <div className="ui text loader">Generating Queries</div>
      </div>
    );
  } else if (props.array && props.array.length > 0) {
    label = 'Click any suggestion to copy it to the editor.';
    content = (
      <React.Fragment>
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
        <div className="ui primary button" onClick={props.handleNL2SQLQueryClick}>
          Generate new suggestions
        </div>
      </React.Fragment>
    );
  } else {
    label = 'SQL query suggestions will appear here.';
    content = (
      <div className="ui one column stretched stackable center aligned grid">
        <div className="middle aligned row">
          <div className="column">
            {props.array && props.array.length === 0 && (
              <em>
                We were unable to generate any queries, sorry! Please try rephrasing your command.
              </em>
            )}
            {/* <div className="ui icon header">
              <i className="lightbulb icon"></i>
            </div> */}
            <div className="ui primary button" onClick={props.handleNL2SQLQueryClick}>
              Generate SQL Suggestions
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="ui top attached label teal">{label}</div>
      {content}
    </React.Fragment>
  );
}
