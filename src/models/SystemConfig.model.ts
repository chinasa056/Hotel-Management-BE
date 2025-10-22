import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Document
export interface ISystemConfig extends Document {
    key: string; 
    value: any;
    updated_at: Date;
}

// Mongoose Schema
const SystemConfigSchema: Schema = new Schema({
    key: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true 
    },
    value: { 
        type: Schema.Types.Mixed, 
        required: true 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    },
});

// Update the updated_at field before saving
SystemConfigSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

//Mongoose Model
const SystemConfigModel = mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);

export default SystemConfigModel;