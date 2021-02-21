import { BIGINT, BOOLEAN, STRING } from 'sequelize';
import db from "./db";

let User = db.define('users', {
    userId: STRING, 
    points: STRING,
    lifetime: {
        type: BIGINT,
        default: 0
    }
});

let Feedback = db.define('feedback', {
    messageId: STRING,
    given: BOOLEAN
});

let Config = db.define('config', {
    key: STRING,
    value: STRING
});

// Sync models to db
db.sync({alter: true})

export {
    User,
    Feedback
}