
export const HOST_URL = `${import.meta.env.VITE_API_BASE_URL}`
export const API = {
    SIGN_IN: `${HOST_URL}/api/login`,
    SIGN_UP: `${HOST_URL}/api/register`,
    ARTIST: `${HOST_URL}/api/artists`,
    DASHBOARD: `${HOST_URL}/api/dashboard`,
    APPLICATIONS: `${HOST_URL}/api/applications`,
    EVENT_APPLICATIONS: `${HOST_URL}/api/eventApplications`,
    Contact_REQUESTS: `${HOST_URL}/api/contact-artists`,
    ARTIST_REQUEST: `${HOST_URL}/api/admin/artists`
}