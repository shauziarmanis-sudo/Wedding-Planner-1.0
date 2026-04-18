export interface SheetSchema {
  properties: {
    title: string;
  };
  sheets: {
    properties: {
      title: string;
      gridProperties?: {
        rowCount?: number;
        columnCount?: number;
      };
    };
    data?: {
      rowData: {
        values: {
          userEnteredValue: {
            stringValue?: string;
            numberValue?: number;
          };
        }[];
      }[];
    }[];
  }[];
}
