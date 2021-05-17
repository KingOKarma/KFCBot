/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable sort-keys */
module.exports = [
    {
        name: "default",
        type: "postgres",
        host:  process.env.dbIp !== null ? process.env.dbIp : "localhost",
        port: 5432,
        username: "postgres",
        password: "password",
        database: "postgres",
        schema: "public",
        synchronize: true,
        logging: false,
        entities: ["build/entity/**/*.js"],
        migrations: ["build/migration/**/*.js"],
        subscribers: ["build/subscriber/**/*.js"],
        cli: {
            entitiesDir: "src/entities",
            migrationsDir: "src/migration",
            subscribersDir: "src/subscriber"
        }
    },
    {
        name: "sqlite",
        type: "sqlite",
        database: "settings.sqlite3",
        entities: ["build/entity/**/*.js"]
    }
];
