import * as XLSX from 'xlsx'

export interface ExcelExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
}

/**
 * Export data to Excel format
 * @param data - Array of objects or 2D array
 * @param options - Export configuration options
 */
export function exportToExcel(
  data: any[] | any[][],
  options: ExcelExportOptions = {}
): void {
  const {
    filename = 'export.xlsx',
    sheetName = 'Sheet1',
  } = options

  try {
    const workbook = XLSX.utils.book_new()

    let worksheet: XLSX.WorkSheet

    if (Array.isArray(data) && data.length > 0) {
      if (Array.isArray(data[0])) {
        worksheet = XLSX.utils.aoa_to_sheet(data as any[][])
      } else {
        worksheet = XLSX.utils.json_to_sheet(data)
      }
    } else {
      throw new Error('Invalid data format. Expected array of objects or 2D array.')
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    XLSX.writeFile(workbook, filename)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw new Error('Failed to export data to Excel')
  }
}

/**
 * Export table data with custom headers
 * @param data - Array of objects
 * @param headers - Custom header mapping { key: displayName }
 * @param options - Export configuration options
 */
export function exportTableToExcel(
  data: any[],
  headers: Record<string, string> = {},
  options: ExcelExportOptions = {}
): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))))
  
  const headerRow = allKeys.map(key => headers[key] || key)
  
  const dataRows = data.map(item => 
    allKeys.map(key => {
      const value = item[key]
      if (value instanceof Date) {
        return value.toLocaleDateString()
      }
      if (typeof value === 'number') {
        return value
      }
      return String(value || '')
    })
  )

  const excelData = [headerRow, ...dataRows]

  exportToExcel(excelData, {
    ...options,
    filename: options.filename || 'table-export.xlsx'
  })
}

/**
 * Export specific table columns to Excel
 * @param data - Array of objects
 * @param columns - Array of column keys to include
 * @param columnHeaders - Custom header mapping
 * @param options - Export configuration options
 */
export function exportColumnsToExcel(
  data: any[],
  columns: string[],
  columnHeaders: Record<string, string> = {},
  options: ExcelExportOptions = {}
): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  const filteredData = data.map(item => {
    const filteredItem: any = {}
    columns.forEach(key => {
      if (item.hasOwnProperty(key)) {
        filteredItem[key] = item[key]
      }
    })
    return filteredItem
  })

  exportTableToExcel(filteredData, columnHeaders, options)
}
