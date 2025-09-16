"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTask = defaultTask;
const user_constants_1 = require("../modules/user/user.constants");
const user_models_1 = require("../modules/user/user.models");
function defaultTask() {
    return __awaiter(this, void 0, void 0, function* () {
        // Add your default task here
        // check admin is exist
        const admin = yield user_models_1.User.findOne({ role: user_constants_1.USER_ROLE === null || user_constants_1.USER_ROLE === void 0 ? void 0 : user_constants_1.USER_ROLE.admin });
        if (!admin) {
            yield user_models_1.User.create({
                name: 'MD Nazmul Hasan',
                email: 'admin@gmail.com',
                phoneNumber: '+8801321834780',
                password: '112233',
                role: 'admin',
            });
        }
    });
}
