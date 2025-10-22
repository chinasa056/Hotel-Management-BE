import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import InternalServerError from '../error/InternalServerError';

class SupabaseClientService {
  private client;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase URL or Service Role Key missing');
    }
    this.client = createClient(url, key, { auth: { persistSession: false } });
  }

  getClient() {
    return this.client;
  }

  async selectFromTable(table: string, conditions: any, selectFields: string = '*'): Promise<any> {
    try {
      const { data, error } = await this.client
        .from(table)
        .select(selectFields)
        .match(conditions)
        .single();
      if (error) {
        throw new InternalServerError(`Failed to select from ${table}`, error);
      }
      return data;
    } catch (error) {
      logger.error(`Error selecting from ${table}:`, error);
      throw error;
    }
  }

  async insertIntoTable(table: string, data: any): Promise<any> {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select();
      if (error) {
        throw new InternalServerError(`Failed to insert into ${table}`, error);
      }
      return result;
    } catch (error) {
      logger.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  }

  async updateTable(table: string, data: any, conditions: any): Promise<any> {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .update(data)
        .match(conditions)
        .select();
      if (error) {
        throw new InternalServerError(`Failed to update ${table}`, error);
      }
      return result;
    } catch (error) {
      logger.error(`Error updating ${table}:`, error);
      throw error;
    }
  }

  async deleteFromTable(table: string, conditions: any): Promise<void> {
    try {
      const { error } = await this.client.from(table).delete().match(conditions);
      if (error) {
        throw new InternalServerError(`Failed to delete from ${table}`, error);
      }
    } catch (error) {
      logger.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }

  async uploadToStorage(bucket: string, path: string, file: Buffer, options: { contentType: string }): Promise<string> {
    try {
      const { error } = await this.client.storage.from(bucket).upload(path, file, options);
      if (error) {
        throw new InternalServerError(`Failed to upload to storage bucket ${bucket}`, error);
      }
    //   const { publicUrl } = this.client.storage.from(bucket).getPublicUrl(path);
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      logger.error(`Error uploading to storage ${bucket}:`, error);
      throw error;
    }
  }
}

export default new SupabaseClientService();