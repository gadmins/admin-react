export interface TableListItem {
  id: number;
  name: string;
  rcode: string;
  rdesc?: string;
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
  sorter?: string;
  name?: string;
  roleId?: number;
  id?: number;
  pageSize?: number;
  currentPage?: number;
}
