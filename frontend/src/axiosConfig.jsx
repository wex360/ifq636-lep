import axios from 'axios';

// LEP-14: relative base URL. In development the CRA proxy (package.json "proxy") forwards /api to :5001;
// on EC2 nginx serves the build and proxies /api, so a changed public IP never needs a rebuild.
const axiosInstance = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
