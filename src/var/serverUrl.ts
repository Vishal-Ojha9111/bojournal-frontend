const serverUrl : string = import.meta.env.VITE_PRODUCTION ? import.meta.env.VITE_SERVER_URL : 'http://localhost:8000'
console.log(serverUrl, import.meta.env.VITE_SERVER_URL, Boolean(import.meta.env.VITE_PRODUCTION))
export default serverUrl