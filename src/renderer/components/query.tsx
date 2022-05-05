import React, { FC, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import { format } from 'sql-formatter';
import AceEditor, { ICommand } from 'react-ace';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import { ResizableBox } from 'react-resizable';
import CheckBox from './checkbox';
import QueryResults from './query-results';
import FormalQueryList from './nl2sql-list-view';
import ServerDBClientInfoModal from './server-db-client-info-modal';
import { BROWSER_MENU_EDITOR_FORMAT } from '../../common/event';
import MenuHandler from '../utils/menu';
import { Query } from '../reducers/queries';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTablesIfNeeded } from '../actions/tables';
import { fetchSQLQuery, clearEverything, editSQL } from '../actions/nl2sql';
import { voiceCommand } from '../actions/voiceCommands';
import { NL2SQLClick, SQLQueryExecuted, CopyQueryButtonClicked } from '../actions/logging';
import Tour from 'reactour';

require('./react-resizable.css');
require('./override-ace.css');

const QUERY_EDITOR_HEIGTH = 200;
const langTools = ace.require('ace/ext/language_tools');

const INFOS = {
  mysql: [
    'MySQL treats commented query as a non select query.' +
      'So you may see "affected rows" for a commented query.',
    'Usually executing a single query per tab will give better results.',
  ],
  sqlserver: [
    'MSSQL treats multiple non select queries as a single query result.' +
      'So you affected rows will show the amount over all queries executed in the same tab.',
    'Usually executing a single query per tab will give better results.',
  ],
};

const EVENT_KEYS = {
  onSelectionChange: 'changeSelection',
};

interface Props {
  widthOffset: number;
  client: string;
  editorName: string;
  allowCancel: boolean;
  query: Query;
  queryRef: RefObject<HTMLDivElement> | null;
  onExecQueryClick: (sqlQuery: string) => void;
  onCancelQueryClick: () => void;
  onCopyToClipboardClick: (rows, type: string, delimiter?: string) => void;
  onCopyToClipboardEditorClick: (text: string) => void;
  onSaveToFileClick: (rows, type: string, delimiter?: string) => void;
  onSQLChange: (sqlQuery: string) => void;
  onSelectionChange: (sqlQuery: string, selectedQuery: string) => void;
  onSelectToggle: (database: string) => void;
  loggingInfo: (logType: string, editorContent: string, schema: [], allSQLQueries: []) => void;
}

const Query: FC<Props> = ({
  widthOffset,
  client,
  editorName,
  allowCancel,
  query,
  queryRef,
  onExecQueryClick,
  onCancelQueryClick,
  onCopyToClipboardClick,
  onCopyToClipboardEditorClick,
  onSaveToFileClick,
  onSQLChange,
  onSelectionChange,
  onSelectToggle,
  loggingInfo,
}) => {
  const {
    isCurrentQuery,
    enabledAutoComplete,
    enabledLiveAutoComplete,
    databases,
    schemas,
    tables,
    views,
    columnsByTable,
    triggersByTable,
    indexesByTable,
    functions,
    procedures,
    tablecolumns,
    nl2SqlGeneratedQueries,
    selectedGeneratedQuery,
    nl2SqlAnnotation,
    isCallingNL2SQL,
    isCallingEditSQL,
    nl2sqlError,
    voiceParsedCommandText,
    voiceParsedCommandConfidence,
    voiceErrorMessage,
    selectedCellRow,
    selectedCellCol,
    selectedCellIsHeader,
  } = useAppSelector((state) => ({
    isCurrentQuery: query.id === state.queries.currentQueryId,
    enabledAutoComplete: state.config.data?.enabledAutoComplete || false,
    enabledLiveAutoComplete: state.config.data?.enabledLiveAutoComplete || false,
    databases: state.databases.items,
    schemas: state.schemas.itemsByDatabase[query.database],
    tables: state.tables.itemsByDatabase[query.database],
    views: state.views.viewsByDatabase[query.database],
    columnsByTable: state.columns.columnsByTable[query.database],
    triggersByTable: state.triggers.triggersByTable[query.database],
    indexesByTable: state.indexes.indexesByTable[query.database],
    functions: state.routines.functionsByDatabase[query.database],
    procedures: state.routines.proceduresByDatabase[query.database],
    tablecolumns: state.tablecolumns,
    nl2SqlGeneratedQueries: state.nl2sqls.queries,
    selectedGeneratedQuery: state.nl2sqls.selectedQuery,
    nl2SqlAnnotation: state.nl2sqls.annotation,
    isCallingNL2SQL: state.nl2sqls.isCalling,
    isCallingEditSQL: state.nl2sqls.isEditing,
    nl2sqlError: state.nl2sqls.errorMessage,
    voiceParsedCommandText: state.voiceCommands.parsedCommandText,
    voiceParsedCommandConfidence: state.voiceCommands.parsedCommandConfidence,
    voiceErrorMessage: state.voiceCommands.errorMessage,
    selectedCellRow: state.nl2sqls.selectedCellRow,
    selectedCellCol: state.nl2sqls.selectedCellCol,
    selectedCellIsHeader: state.nl2sqls.selectedCellIsHeader,
  }));

  const menuHandler = useMemo(() => new MenuHandler(), []);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [wrapEnabled, setWrapEnabled] = useState(false);

  const [isShowingCopiedAlert, setShowingCopiedAlert] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [isColumnsFetch, setIsColumnsFetch] = useState(false);
  const [isTableFetched, setIsTableFetch] = useState(false);

  const [isTourOpen, setIsTourOpen] = useState(false);
  //const [isShowingMore, setIsShowingMore] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder>();

  const editorRef = useRef<AceEditor>(null);

  const dispatch = useAppDispatch();

  const closeTour = () => {
    setIsTourOpen(false);
  };
  const openTour = () => {
    const timeId = setTimeout(() => {
      // After 3 seconds set the show value to false
      setIsTourOpen(true);
    }, 3000);

    return () => {
      clearTimeout(timeId);
    };
  };
  useEffect(() => {
    openTour();
  }, []);

  const handleSelectionChange = useCallback(() => {
    if (editorRef.current) {
      const elem = editorRef.current;
      debounce(() => onSelectionChange(query.query, elem.editor.getCopyText()), 100);
    }
  }, [onSelectionChange, query.query, editorRef]);

  const rowColumnToFlat = (row: number, column: number, text: string) => {
    const prevRows = text.split('\n').slice(0, row);
    const previousLengths = prevRows.map((line) => line.length);
    return column + previousLengths.reduce((a, b) => a + b, 0);
  };

  const getCurrentSelectionData = useCallback(() => {
    if (!query || !query.results || !selectedCellCol) {
      return null;
    }
    const result = query.results[0];
    let data;
    if (selectedCellIsHeader) {
      data = selectedCellCol;
    } else {
      data = result.rows[selectedCellRow][selectedCellCol];
    }

    return {
      column: selectedCellCol,
      row: selectedCellRow,
      isHeader: selectedCellIsHeader,
      data,
    };
  }, [selectedCellCol, selectedCellRow, selectedCellIsHeader, query]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const editor = editorRef.current.editor;

    // @ts-ignore
    editor.on(EVENT_KEYS.onSelectionChange, handleSelectionChange);

    // init with the auto complete disabled
    editor.completers = [];
    // @ts-ignore
    editor.setOption('enableBasicAutocompletion', false);
    editor.setOption(
      'placeholder',
      '\n\n\nType in SQL, or type in a natural language command and press "Generate SQL Suggestions".\nYou can also press "Speak Command" to speak a natural language command.',
    );

    editor.focus();

    menuHandler.setMenus({
      [BROWSER_MENU_EDITOR_FORMAT]: () => editor.execCommand('format'),
    });
  }, [editorRef, handleSelectionChange, menuHandler]);

  useEffect(() => {
    if (!enabledAutoComplete || !editorRef.current) {
      return;
    }

    const mapCompletionTypes = (items, type: string) => {
      let result = items;
      if (!Array.isArray(items)) {
        result = Object.keys(items || {}).reduce((all, name) => all.concat(items[name]), []);
      }

      return (result || []).map(({ name }) => ({ name, type }));
    };

    const completions = [
      ...mapCompletionTypes(databases, 'database'),
      ...mapCompletionTypes(schemas, 'schema'),
      ...mapCompletionTypes(tables, 'table'),
      ...mapCompletionTypes(columnsByTable, 'column'),
      ...mapCompletionTypes(triggersByTable, 'trigger'),
      ...mapCompletionTypes(indexesByTable, 'index'),
      ...mapCompletionTypes(views, 'view'),
      ...mapCompletionTypes(functions, 'function'),
      ...mapCompletionTypes(procedures, 'procedure'),
    ].map(({ name, type }) => ({
      name,
      value: name,
      score: 1,
      meta: type,
    }));

    const customCompleter = {
      getCompletions(editor, session, pos, prefix, callback) {
        callback(null, completions);
      },
    };

    // force load only the current available completers
    // discarding any previous existing completers
    editorRef.current.editor.completers = [
      langTools.snippetCompleter,
      langTools.textCompleter,
      langTools.keyWordCompleter,
      customCompleter,
    ];

    // @ts-ignore
    editorRef.current.editor.setOption('enableBasicAutocompletion', true);

    // @ts-ignore
    editorRef.current.editor.setOption('enableLiveAutocompletion', enabledLiveAutoComplete);
  }, [
    columnsByTable,
    databases,
    enabledAutoComplete,
    enabledLiveAutoComplete,
    functions,
    indexesByTable,
    procedures,
    schemas,
    tables,
    triggersByTable,
    views,
  ]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    const elem = editorRef.current;
    return () => {
      elem.editor.removeListener(EVENT_KEYS.onSelectionChange, handleSelectionChange);
    };
  }, [editorRef, handleSelectionChange]);

  useEffect(() => {
    return () => {
      menuHandler.dispose();
    };
  }, [menuHandler]);

  useEffect(() => {
    if (query.isExecuting && query.isDefaultSelect) {
      window.scrollTo(0, 0);
    }
  }, [query]);

  useEffect(() => {
    if (isCurrentQuery) {
      editorRef.current?.editor.focus();
    }
  }, [isCurrentQuery]);

  useEffect(() => {
    if (!isColumnsFetch && isTableFetched) {
      onSelectToggle(query.database);
      setIsColumnsFetch(true);
    }
  }, [onSelectToggle, query]);

  useEffect(() => {
    if (!isTableFetched) {
      fetchTablesIfNeeded(query.database);
      setIsTableFetch(true);
    }
  }, [onSelectToggle, query]);

  useEffect(() => {
    const timeId = setTimeout(() => {
      // After 3 seconds set the show value to false
      setShowingCopiedAlert(false);
    }, 300);

    return () => {
      clearTimeout(timeId);
    };
  }, [isShowingCopiedAlert]);

  // Initialize the media recorder, only do it once
  // useEffect(() => {
  //   if (!mediaRecorderRef.current) {
  //     navigator.mediaDevices
  //       .getUserMedia({
  //         audio: true,
  //         video: false,
  //       })
  //       .then((stream) => {
  //         const recorder = new MediaRecorder(stream);

  //         recorder.addEventListener('dataavailable', (event) => {
  //           // const audioUrl = URL.createObjectURL(event.data);
  //           // const audio = new Audio(audioUrl);
  //           // audio.play();
  //           dispatch(voiceCommand(event.data));
  //         });

  //         mediaRecorderRef.current = recorder;
  //       });
  //   }
  // }, []);

  // when a generated query is selected, set editor content to it
  useEffect(() => {
    if (selectedGeneratedQuery && selectedGeneratedQuery.length >= 1) {
      const formatted = `-- ${nl2SqlAnnotation}\n${selectedGeneratedQuery}`;
      onSQLChange(formatted);
    }
  }, [onSQLChange, selectedGeneratedQuery]);

  useEffect(() => {
    if (voiceErrorMessage && voiceErrorMessage.length > 0) {
      return;
    }
    if (!voiceParsedCommandText || voiceParsedCommandText.length == 0) {
      return;
    }

    const editorText = editorRef.current?.editor.getValue();
    const sqlLines = editorText?.split('\n').filter((val) => !val.startsWith('--'));
    const queryToUse = sqlLines?.join('\n').trim();

    if (queryToUse && queryToUse.length > 0) {
      const selectionRange = editorRef.current?.editor.getSelectionRange();
      const selection = selectionRange &&
        editorText && [
          rowColumnToFlat(selectionRange.start.row, selectionRange.start.column, editorText),
          rowColumnToFlat(selectionRange.end.row, selectionRange.end.column, editorText),
        ];
      const selectionIfExists = selection && selection[0] !== selection[1] ? selection : undefined;
      dispatch(
        editSQL({
          query: queryToUse,
          selection: selectionIfExists,
          command: voiceParsedCommandText,
          schema: tablecolumns,
        }),
      );
    } else {
      dispatch(fetchSQLQuery(voiceParsedCommandText, tablecolumns, getCurrentSelectionData()));
    }
  }, [voiceParsedCommandText, voiceErrorMessage, getCurrentSelectionData]);

  const handleCopyText = useCallback(
    (tablecolumns, nl2SqlGeneratedQueries) => {
      const sqlQuery = editorRef.current?.editor.getCopyText() || query.query;
      onCopyToClipboardEditorClick(sqlQuery);
      setShowingCopiedAlert(true);
      if (sqlQuery) {
        loggingInfo(CopyQueryButtonClicked, sqlQuery, tablecolumns, nl2SqlGeneratedQueries);
      }
    },
    [onCopyToClipboardEditorClick, selectedGeneratedQuery],
  ); //query.query, editorRef

  const handleNL2SQLQueryClick = useCallback(
    (tablecolumns) => {
      const copyText =
        editorRef.current?.editor.getCopyText() || editorRef.current?.editor.getValue();
      dispatch(fetchSQLQuery(copyText, tablecolumns, getCurrentSelectionData()));
      if (copyText) {
        loggingInfo(NL2SQLClick, copyText, tablecolumns, []);
      }
    },
    [onSQLChange, editorRef, onSelectToggle, getCurrentSelectionData],
  );

  const handleExecQueryClick = useCallback(
    (tablecolumns, nl2SqlGeneratedQueries) => {
      const sqlQuery = editorRef.current?.editor.getCopyText() || query.query;
      onExecQueryClick(sqlQuery);
      if (sqlQuery) {
        loggingInfo(SQLQueryExecuted, sqlQuery, tablecolumns, nl2SqlGeneratedQueries);
      }
    },
    [onExecQueryClick, selectedGeneratedQuery],
  ); //query.query, editorRef

  const onRecordingClick = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        return;
      }
      recorder.stop();
    } else {
      setIsRecording(true);
      mediaRecorderRef.current?.start();
    }
  }, [isRecording]);

  const onDiscQueryClick = useCallback(() => {
    // onSQLChange('');
    dispatch(clearEverything());
  }, []);

  const handleCancelQueryClick = useCallback(() => {
    onCancelQueryClick();
  }, [onCancelQueryClick]);

  const onShowInfoClick = useCallback(() => {
    setInfoModalVisible(true);
  }, []);

  const onQueryBoxResize = useCallback(() => {
    editorRef.current?.editor.resize();
  }, [editorRef]);

  const onWrapContentsChecked = useCallback(() => {
    setWrapEnabled(true);
  }, []);

  const onWrapContentsUnchecked = useCallback(() => {
    setWrapEnabled(false);
  }, []);

  const onFocus = useCallback(() => {
    editorRef.current?.editor.focus();
  }, []);

  const commands = useMemo(() => {
    return [
      {
        name: 'increaseFontSize',
        bindKey: 'Ctrl-=|Ctrl-+',
        exec(editor) {
          const size = parseInt(editor.getFontSize(), 10) || 12;
          // @ts-ignore
          editor.setFontSize(size + 1);
        },
      },
      {
        name: 'decreaseFontSize',
        bindKey: 'Ctrl+-|Ctrl-_',
        exec(editor) {
          const size = parseInt(editor.getFontSize(), 10) || 12;
          // @ts-ignore
          editor.setFontSize(Math.max(size - 1 || 1));
        },
      },
      {
        name: 'resetFontSize',
        bindKey: 'Ctrl+0|Ctrl-Numpad0',
        exec(editor) {
          // @ts-ignore
          editor.setFontSize(12);
        },
      },
      {
        name: 'selectCurrentLine',
        bindKey: { win: 'Ctrl-L', mac: 'Command-L' },
        exec(editor) {
          const { row } = editor.selection.getCursor();
          const endColumn = editor.session.getLine(row).length;
          editor.selection.setSelectionRange({
            start: { column: 0, row },
            end: { column: endColumn, row },
          });
        },
      },
      {
        name: 'format',
        bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
        exec: (editor) => {
          if (query.query) {
            editor.setValue(
              format(query.query, {
                // @ts-ignore
                language: ['cassandra', 'sqlite'].includes(client)
                  ? 'sql'
                  : client === 'sqlserver'
                  ? 'tsql'
                  : client,
              }),
            );
          }
        },
      },
    ] as ICommand[];
  }, [client, query.query]);

  const infos = INFOS[client];
  const tourConfig = [
    {
      selector: '#',
      content: `Ok, let's start with the function of the tool.`,
    },
    {
      // generate several SQL suggestions
      selector:
        '#react-tabs-1 > div > div > div.react-resizeable-container > div.react-resizable.react-resizable-se-resize.no-padding.ui.raised.segment.itemlist.react-resizable > div.ui.one.column.stretched.stackable.center.aligned.grid > div > div > div',
      content: `Use this button to generate several SQL suggestions.`,
    },
    {
      // copy to clipboard
      selector:
        '#react-tabs-1 > div > div > div.ui.secondary.menu > div.left.menu > div > div > button.ui.teal.button',
      content: `When you click copy button, you could use ctrl + v to paste anywhere.`,
    },
    {
      // record command
      selector:
        '#react-tabs-1 > div > div > div.ui.secondary.menu > div.left.menu > div > div > div',
      content: `You could use voice control for limiting the query. Try to click the button and speak "only ten rows".`,
    },
    {
      // execute
      selector:
        '#react-tabs-1 > div > div > div.ui.secondary.menu > div.left.menu > div > div > button.ui.positive.button',
      content: `You could hit execution to execute the result of the SQL query.`,
    },
  ];
  return (
    <div>
      <div>
        <Tour
          onRequestClose={closeTour}
          steps={tourConfig}
          isOpen={isTourOpen}
          maskClassName="mask"
          className="helper"
        />

        <div className="react-resizeable-container">
          <ResizableBox
            className="react-resizable react-resizable-se-resize ui segment"
            height={QUERY_EDITOR_HEIGTH}
            width={500}
            onResizeStop={onQueryBoxResize}>
            <>
              <div ref={queryRef} tabIndex={-1} onFocus={onFocus}></div>
              <AceEditor
                mode="sql"
                theme="github"
                name={editorName}
                height="calc(100% - 15px)"
                width="100%"
                ref={editorRef}
                value={query.query}
                wrapEnabled={wrapEnabled}
                showPrintMargin={false}
                commands={commands}
                editorProps={{ $blockScrolling: Infinity }}
                onChange={debounce(onSQLChange, 50)}
                enableBasicAutocompletion
                enableLiveAutocompletion
              />
              <div className="ui secondary menu" style={{ marginTop: 0 }}>
                <div className="right menu">
                  <CheckBox
                    name="wrapQueryContents"
                    label="Wrap Contents"
                    checked={wrapEnabled}
                    onChecked={onWrapContentsChecked}
                    onUnchecked={onWrapContentsUnchecked}
                  />
                </div>
              </div>
            </>
          </ResizableBox>
          <ResizableBox
            className="react-resizable react-resizable-se-resize no-padding ui raised segment itemlist"
            height={QUERY_EDITOR_HEIGTH}
            width={500}
            // style= {{padding: 0 }}
            onResizeStop={onQueryBoxResize}>
            <>
              <FormalQueryList
                isLoading={isCallingNL2SQL}
                handleNL2SQLQueryClick={() => handleNL2SQLQueryClick(tablecolumns)}
                array={nl2SqlGeneratedQueries}
                selected={selectedGeneratedQuery}
                loggingInfo={loggingInfo}
                schema={tablecolumns}
              />
            </>
          </ResizableBox>
        </div>
        {isShowingCopiedAlert && (
          <div className={`alert alert-success`}>
            <div className="ui success message">
              <div className="header">Text has been copied!</div>
              <p>You may now click Ctrl + V to paste it to anywhere.</p>
            </div>
          </div>
        )}

        <div className="ui secondary menu" style={{ marginTop: 0 }}>
          {infos && (
            <div className="item">
              <span>
                <button
                  className="ui icon button small"
                  title="Query Information"
                  onClick={onShowInfoClick}>
                  <i className="icon info" />
                </button>
              </span>
            </div>
          )}
          <div className="left menu">
            <div className="item">
              <div className="ui buttons">
                <button
                  className="ui teal button"
                  onClick={() => {
                    return handleCopyText(tablecolumns, nl2SqlGeneratedQueries);
                  }}>
                  Copy to Clipboard
                </button>
                {isRecording ? (
                  <div className="ui red button" onClick={onRecordingClick}>
                    <i className="x icon"></i> Listening&nbsp;&nbsp;
                    <div className="ui active inline tiny loader"></div>
                  </div>
                ) : (
                  <div className="ui red button" onClick={onRecordingClick}>
                    <i className="microphone icon"></i> Record Command
                  </div>
                )}
                <button
                  className={`ui positive button ${query.isExecuting ? 'loading' : ''}`}
                  onClick={() => handleExecQueryClick(tablecolumns, nl2SqlGeneratedQueries)}>
                  Execute Query
                </button>
              </div>
            </div>
          </div>
          <div className="right menu">
            <div className="item">
              <div className="ui buttons">
                {/* <div className="or" /> */}
                {query.isExecuting && allowCancel ? (
                  <button
                    className={`ui negative button ${query.isCanceling ? 'loading' : ''}`}
                    onClick={handleCancelQueryClick}>
                    Cancel
                  </button>
                ) : (
                  <button className="ui button" onClick={onDiscQueryClick}>
                    {isCallingNL2SQL ? 'Cancel Suggestions' : 'Clear Suggestions'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <QueryResults
        widthOffset={widthOffset}
        heightOffset={QUERY_EDITOR_HEIGTH}
        onSaveToFileClick={onSaveToFileClick}
        onCopyToClipboardClick={onCopyToClipboardClick}
        copied={query.copied}
        saved={query.saved}
        query={query.queryHistory[query.queryHistory.length - 1]}
        results={query.results}
        isExecuting={query.isExecuting}
        error={query.error}
      />
      {infoModalVisible && (
        <ServerDBClientInfoModal
          infos={infos}
          client={client}
          onCloseClick={() => setInfoModalVisible(false)}
        />
      )}
    </div>
  );
};

Query.displayName = 'Query';
export default Query;
