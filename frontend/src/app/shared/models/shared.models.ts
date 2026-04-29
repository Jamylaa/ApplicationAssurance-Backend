export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface FilterRequest {
  searchTerm?: string;
  filters?: { [key: string]: any };
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'status';
  sortable?: boolean;
  filterable?: boolean;
  format?: (value: any) => string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  key: string;
  label: string;
  icon?: string;
  action: (item: any) => void;
  disabled?: (item: any) => boolean;
  visible?: (item: any) => boolean;
  style?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

export interface DataTableConfig {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  multiSelect?: boolean;
  actions?: TableAction[];
  pagination?: {
    enabled: boolean;
    pageSize: number;
    pageSizeOptions: number[];
  };
  sorting?: {
    enabled: boolean;
    defaultSort?: string;
    defaultDirection?: 'ASC' | 'DESC';
  };
}

export interface SearchRequest {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
}

export interface DateRangeFilter {
  start: Date | null;
  end: Date | null;
  label: string;
}

export interface NumberRangeFilter {
  min: number | null;
  max: number | null;
  label: string;
}

export interface SelectFilterOption {
  value: any;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface AdvancedFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
  value: any;
  label?: string;
}

export interface FilterGroup {
  operator: 'AND' | 'OR';
  filters: AdvancedFilter[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  columns?: string[];
  filters?: FilterRequest;
  includeHeaders?: boolean;
}

export interface BulkAction {
  key: string;
  label: string;
  icon?: string;
  action: (selectedItems: any[]) => void;
  disabled?: (selectedItems: any[]) => boolean;
  confirmMessage?: string;
  style?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

export interface DataTableState {
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
  filters: FilterRequest;
  selectedItems: any[];
  searchTerm: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
  warnings?: string[];
}

export interface ApiError {
  status: number;
  statusText: string;
  url: string;
  timestamp: string;
  message: string;
  details: any;
  type: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CLIENT_ERROR' | 'SERVER_ERROR' | 'UNKNOWN';
}

export interface LoadingState {
  loading: boolean;
  message?: string;
  progress?: number;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  timestamp: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  pageSize: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
  active?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content?: any;
  disabled?: boolean;
  badge?: string | number;
  closable?: boolean;
}

export interface StepItem {
  id: string;
  label: string;
  icon?: string;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
  description?: string;
}

export interface WizardConfig {
  steps: StepItem[];
  currentStep: number;
  showProgress?: boolean;
  allowSkip?: boolean;
  onFinish?: () => void;
  onCancel?: () => void;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metric' | 'list';
  data: any;
  config?: any;
  refreshInterval?: number;
  loading?: boolean;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
  trend?: number[];
}
