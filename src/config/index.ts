
export default {

    port: process.env.PORT || 3000,
    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },
    api: {
        prefix: '/api',
    },

}