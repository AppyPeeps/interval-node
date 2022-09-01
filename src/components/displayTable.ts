import { z } from 'zod'
import Logger from '../classes/Logger'
import { tableRow, T_IO_PROPS, menuItem } from '../ioSchema'
import { TableColumn } from '../types'
import { columnsBuilder, tableRowSerializer } from '../utils/table'

function missingColumnMessage(component: string) {
  return (column: string) =>
    `Provided column "${column}" not found in data for ${component}`
}

export default function displayTable(logger: Logger) {
  return function displayTable<Row extends z.input<typeof tableRow> = any>(
    props: Omit<T_IO_PROPS<'DISPLAY_TABLE'>, 'data' | 'columns'> & {
      data: Row[]
      columns?: (TableColumn<Row> | string)[]
      rowMenuItems?: (row: Row) => z.infer<typeof menuItem>[]
    }
  ) {
    const columns = columnsBuilder(props, column =>
      logger.error(missingColumnMessage('io.display.table')(column))
    )

    const data = props.data.map((row, idx) =>
      tableRowSerializer(idx, row, columns, props.rowMenuItems)
    )

    return {
      props: {
        ...props,
        data,
        columns,
      },
    }
  }
}
