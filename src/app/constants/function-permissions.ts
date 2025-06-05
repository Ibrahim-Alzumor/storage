export const PRODUCT_VIEW = 'product:view';
export const PRODUCT_CREATE = 'product:create';
export const PRODUCT_EDIT = 'product:edit';
export const PRODUCT_DELETE = 'product:delete';
export const PRODUCT_SCAN = 'product:scan';

export const ORDER_VIEW = 'order:view';
export const ORDER_CREATE = 'order:create';
export const ORDER_MANAGE = 'order:manage';
export const ORDER_INVOICE = 'order:invoice';

export const USER_VIEW = 'user:view';
export const USER_CREATE = 'user:create';
export const USER_EDIT = 'user:edit';
export const USER_DISABLE = 'user:disable';

export const REPORT_VIEW = 'report:view';
export const REPORT_EXPORT = 'report:export';

export const ADMIN_CLEARANCE_LEVELS = 'admin:clearance-levels';


export const PRODUCT_ADMIN_FUNCTIONS = [
  PRODUCT_VIEW,
  PRODUCT_CREATE,
  PRODUCT_EDIT,
  PRODUCT_DELETE,
  PRODUCT_SCAN,
];

export const ORDER_ADMIN_FUNCTIONS = [
  ORDER_VIEW,
  ORDER_CREATE,
  ORDER_MANAGE,
  ORDER_INVOICE,
];

export const USER_ADMIN_FUNCTIONS = [
  USER_VIEW,
  USER_CREATE,
  USER_EDIT,
  USER_DISABLE,
];

export const REPORT_ADMIN_FUNCTIONS = [
  REPORT_VIEW,
  REPORT_EXPORT,
];

export const ADMIN_FUNCTIONS = [
  ADMIN_CLEARANCE_LEVELS,
];

export const ALL_FUNCTIONS = [
  ...PRODUCT_ADMIN_FUNCTIONS,
  ...ORDER_ADMIN_FUNCTIONS,
  ...USER_ADMIN_FUNCTIONS,
  ...REPORT_ADMIN_FUNCTIONS,
  ...ADMIN_FUNCTIONS
];
