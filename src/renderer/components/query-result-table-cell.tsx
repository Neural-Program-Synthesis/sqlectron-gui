import isPlainObject from 'lodash/isPlainObject';
import classNames from 'classnames';
import React, { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import ContextMenu from '../utils/context-menu';
import * as eventKeys from '../../common/event';
import { valueToString } from '../../common/utils/convert';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectCell, unselectAll } from '../actions/nl2sql';

const MENU_CTX_ID = 'CONTEXT_MENU_TABLE_CELL';

interface Props {
  rowIndex: number;
  col: string;
  data: any;
  onOpenPreviewClick: (value: any) => void;
}

const QueryResultTableCell: FC<Props> = ({ rowIndex, col, data, onOpenPreviewClick }) => {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [showMenuEvent, setShowMenuEvent] = useState<MouseEvent | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (contextMenu) {
      return () => {
        contextMenu.dispose();
      };
    }
  }, [contextMenu]);

  const { isSelected } = useAppSelector((state) => ({
    isSelected:
      col === state.nl2sqls.selectedCellCol &&
      (rowIndex === state.nl2sqls.selectedCellRow || state.nl2sqls.selectedCellIsHeader),
  }));

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (isSelected) {
        dispatch(unselectAll());
      } else {
        dispatch(
          selectCell({
            row: rowIndex,
            col: col,
            isHeader: false,
          }),
        );
      }
    },
    [isSelected, rowIndex, col],
  );

  const getValue = useCallback(() => {
    return data[rowIndex][col];
  }, [data, col, rowIndex]);

  const onContextMenu = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      const value = getValue();

      const hasPreview = typeof value === 'string' || isPlainObject(value);

      if (!contextMenu && hasPreview) {
        const newContextMenu = new ContextMenu(MENU_CTX_ID);

        newContextMenu.append({
          label: 'Open Preview',
          event: eventKeys.BROWSER_MENU_OPEN_PREVIEW,
          click: () => onOpenPreviewClick(value),
        });

        newContextMenu.build();
        setContextMenu(newContextMenu);
      }
      event.persist();
      setShowMenuEvent(event);
    },
    [contextMenu, getValue, onOpenPreviewClick],
  );

  useEffect(() => {
    if (showMenuEvent && contextMenu) {
      contextMenu.popup({
        x: showMenuEvent.clientX,
        y: showMenuEvent.clientY,
      });
      setShowMenuEvent(null);
    }
  }, [contextMenu, showMenuEvent]);

  const value = getValue();

  const divClassName = classNames(
    {
      item: true,
    },
    {
      'ui teal': isSelected,
    },
  );

  const spanClassName = classNames({
    'ui mini grey label table-cell-type-null': value === null,
  });

  return (
    <div
      style={{
        backgroundColor: isSelected ? '#dbeeff' : 'white',
        cursor: isHovered ? 'pointer' : 'default',
      }}
      className={divClassName}
      onContextMenu={onContextMenu}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {value === null ? <span className={spanClassName}>NULL</span> : valueToString(value)}
    </div>
  );
};

QueryResultTableCell.displayName = 'QueryResultTableCell';
export default QueryResultTableCell;
