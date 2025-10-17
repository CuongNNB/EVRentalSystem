// Compatibility entry: re-export the project's axios instance and api helpers
// Some pages import from '../api' (relative to pages) — provide a default export
// that points to the axios instance in ../utils/api.js and also expose helpers.

import api from '../utils/api';
import * as stations from './stations';
import * as vehicles from './vehicles';

export default api;

// Optional named exports for convenience
export { stations, vehicles };
