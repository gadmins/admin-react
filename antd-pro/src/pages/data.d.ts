export interface TableListItem {
  id: number;
  updatedAt: Date;
  createdAt: Date;
  enable: boolean;
  [prop: string]: any;
}

export interface TableListPagination {
  total: number;
  pageSize: number;
  current: number;
}

export interface TableListData {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
}

export interface TableListParams {
  pageSize?: number;
  currentPage?: number;
  [prop: string]: any;
}
