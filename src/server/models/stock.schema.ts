import mongoose, { Model, Schema } from "mongoose";

import { COMPANY_FIELDS, COMPANY_FORMS, StockInterface, StockInterfaceWithId, ValuePoint, } from "@/types/stock.interface";

const stockSchema = new Schema<StockInterface>(
    {
        symbol: {
            type: Schema.Types.String,
            required: true,
        },
        gross_volume: {
            type: Schema.Types.Number,
            required: true,
        },
        timeline: {
            type: [
                {
                    date: {
                        type: Schema.Types.Number,
                        required: true,
                    },
                    price: {
                        type: Schema.Types.Number,
                        required: true,
                    },
                    volume: {
                        type: Schema.Types.Number,
                        required: true,
                    },
                    dividend: {
                        type: Schema.Types.Number,
                        required: true,
                    },
                },
            ],
        },
        issued: {
            type: Schema.Types.Date,
            required: false,
        },
        company: {
            name: {
                type: Schema.Types.String,
                required: true,
                text: true,
            },
            field: {
                type: Schema.Types.String,
                required: true,
                enum: Object.values(COMPANY_FIELDS),
            },
            form: {
                type: Schema.Types.String,
                required: true,
                enum: Object.values(COMPANY_FORMS),
            },
            established: {
                type: Schema.Types.Date,
                required: false,
            },
            description: {
                type: Schema.Types.String,
                required: false,
            },
            assets: {
                type: Schema.Types.Number,
                required: false,
            },
            headquarters: {
                type: Schema.Types.String,
                required: false,
            },
            employees: {
                type: Schema.Types.Number,
                required: false,
            }
        },
        traders: [
            {
                type: Schema.Types.ObjectId,
                ref: "Portfolio",
                required: true,
            },
        ],
    },
    { toJSON: { virtuals: true } }
);


stockSchema.virtual("market_valuation").get(function (this: StockInterfaceWithId) {
    if (this.timeline.length < 1) return 0;
    const last_point: ValuePoint = this.timeline[this.timeline.length - 1];
    return last_point.price * this.gross_volume;
});

stockSchema.virtual("slope").get(function (this: StockInterfaceWithId) {
    if (this.timeline.length < 2) return 0;
    const last_point: ValuePoint = this.timeline[this.timeline.length - 1];
    const second_last_point: ValuePoint = this.timeline[this.timeline.length - 2];
    const diff = last_point.price - second_last_point.price;
    return diff / second_last_point.price;
});

stockSchema.virtual("double_slope").get(function (this: StockInterfaceWithId) {
    if (this.timeline.length < 3) return 0;
    const last_point: ValuePoint = this.timeline[this.timeline.length - 1];
    const second_last_point: ValuePoint = this.timeline[this.timeline.length - 2];
    const last_diff = last_point.price - second_last_point.price;

    const last_slope = last_diff / second_last_point.price;

    const third_last_point: ValuePoint = this.timeline[this.timeline.length - 3];
    const second_last_diff = second_last_point.price - third_last_point.price;
    const second_last_slope = second_last_diff / third_last_point.price;
    const slope_diff = last_slope - second_last_slope;
    return slope_diff / second_last_slope;
});

stockSchema.virtual("fall_since_peak").get(function (this: StockInterfaceWithId) {
    if (this.timeline.length < 2) return 0;
    this.timeline.sort((a, b) => a.date - b.date);
    const latest_price = this.timeline[this.timeline.length - 1].price;
    const peak_price = Math.max(...this.timeline.map((point) => point.price));
    const diff = latest_price - peak_price;
    return diff / peak_price;
});

stockSchema.virtual("rise_since_trough").get(function (this: StockInterfaceWithId) {
    if (this.timeline.length < 2) return 0;
    this.timeline.sort((a, b) => a.date - b.date);
    const latest_price = this.timeline[this.timeline.length - 1].price;
    const trough_price = Math.min(...this.timeline.map((point) => point.price));
    const diff = latest_price - trough_price;
    return diff / trough_price;
});

const StockModel = mongoose.models["Stock"] as Model<StockInterface> ?? mongoose.model<StockInterface>("Stock", stockSchema);



export default StockModel;