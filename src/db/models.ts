import { BIGINT, BOOLEAN, STRING } from 'sequelize';
import db from "./db";

let User = db.define('users', {
    guildId: STRING,
    userId: STRING, 
    points: STRING,
    lifetime: {
        type: BIGINT,
        default: 0
    }
});

let Feedback = db.define('feedback', {
    guildId: STRING,
    messageId: STRING,
    given: BOOLEAN
});

let Config = db.define('config', {
    guildId: STRING,
    key: STRING,
    value: STRING
});

// Sync models to db
db.sync({alter: true})

export {
    User,
    Feedback
}