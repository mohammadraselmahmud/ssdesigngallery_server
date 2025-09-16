"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSearchableFields = exports.Role = exports.gender = exports.USER_ROLE = void 0;
exports.USER_ROLE = {
    super_admin: 'super_admin',
    sub_admin: 'sub_admin',
    admin: 'admin',
    user: 'user',
    vendor: 'vendor',
};
exports.gender = ['Male', 'Female', 'Others'];
exports.Role = ['admin', 'super_admin', 'sub_admin', 'user', 'vendor'];
exports.userSearchableFields = ['shopId', 'email'];
