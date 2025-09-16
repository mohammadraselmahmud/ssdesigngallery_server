"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sliderSchema = new mongoose_1.Schema({
    sliderImage: {
        type: String,
        required: [true, 'Slider image must be required'],
        trim: true,
    },
}, {
    timestamps: true,
});
const Slider = (0, mongoose_1.model)('Slider', sliderSchema);
exports.default = Slider;
