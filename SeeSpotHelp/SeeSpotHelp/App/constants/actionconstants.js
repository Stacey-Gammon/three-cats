﻿"use strict"

var ActionConstants = Object.freeze(
    {
        LOGIN_USER_SUCCESS: 0,
        LOGOUT_USER: 1,
        LOGIN_USER_ERROR: 2,
        NEW_GROUP_ADDED: 3,
        MEMBER_DOWNLOADED: 6,
        GROUP_DELETED: 7,
        ANIMAL_ACTIVITY_ADDED: 8,
        USER_UPDATED: 9,
        GROUP_UPDATED: 10,
        ANIMAL_ACTIVITY_DELETED: 11,
        ANIMAL_ADDED: 12,
        ANIMAL_CHANGED: 13,
        ANIMAL_DELETED: 14
    }
);

module.exports = ActionConstants;
