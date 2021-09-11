module.exports = {
    apps: [
        {
            name: "nodejs-test-app",
            script: "./server.js",
            instances  : 3,
            error_file: './errors/err.log',
            out_file: './errors/out.log',
            log_file: './errors/combined.log',
            exec_mode  : "cluster",
            env: {
                ODE_ENV: "development",
            },
            env_staging: {
                NODE_ENV: "staging",
            },
            env_production: {
                NODE_ENV: "production",
            }
        }
    ]
}