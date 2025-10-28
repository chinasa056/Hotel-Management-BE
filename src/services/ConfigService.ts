import SystemConfigModel, { ISystemConfig } from '../models/SystemConfig.model';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import InternalServerError from '../error/InternalServerError';
import { logger } from '../utils/logger';
import { error } from 'console';
import { Errors } from '../enum/error';

class ConfigService {
    // Cache for faster lookup of settings
    private configCache: Map<string, any> = new Map();

    //  Retrieves a configuration value by key, using the cache first.
     
    public async getConfig(key: string): Promise<any> {
        const uppercaseKey = key.toUpperCase();
        
        //Check Cache
        if (this.configCache.has(uppercaseKey)) {
            return this.configCache.get(uppercaseKey);
        }

        try {
            // Query MongoDB
            const config = await SystemConfigModel.findOne({ key: uppercaseKey });

            if (!config) {
                // If a key is missing, treat it as a critical operational error
                throw new ResourceNotFoundError(`System configuration key '${key}' not found.`, null, error);
            }

            //  Update Cache and return value
            this.configCache.set(config.key, config.value);
            return config.value;

        } catch (error) {
            logger.error(`Error fetching config key ${key}:`, error);
            if (error instanceof ResourceNotFoundError) throw error;
            throw new InternalServerError('Failed to retrieve system configuration.', error as Error);
        }
    }

    //  Updates a configuration key. Only accessible to Super Admin.
    public async updateConfig(key: string, value: any): Promise<ISystemConfig> {
        const uppercaseKey = key.toUpperCase();
        
        try {
            const updatedConfig = await SystemConfigModel.findOneAndUpdate(
                { key: uppercaseKey },
                { value: value },
                { new: true, upsert: true, runValidators: true } 
            );

            if (!updatedConfig) {
                 throw new InternalServerError('Failed to update system configuration.', Errors.SERVER_ERROR as unknown as Error);
            }

            // Invalidate/Update Cache immediately
            this.configCache.set(updatedConfig.key, updatedConfig.value);
            return updatedConfig;

        } catch (error) {
            logger.error(`Error updating config key ${key}:`, error);
            throw new InternalServerError('Failed to update system configuration.', error as Error);
        }
    }
    
    // Method to load all configs on startup
    public async loadAllConfigs(): Promise<void> {
        try {
            const configs = await SystemConfigModel.find({});
            configs.forEach(config => {
                this.configCache.set(config.key, config.value);
            });
            logger.info(`Loaded ${configs.length} system configurations into cache.`);
        } catch (error) {
            logger.error('Failed to load initial system configurations:', error);
            // Don't exit process, let services request configs as needed.
        }
    }
}

export default new ConfigService();