// src/utils/pdfUtils.ts
import puppeteer from 'puppeteer';
import { logger } from './logger';

export const generatePdfBuffer = async (html: string): Promise<Buffer> => {
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Recommended for prod
    });
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfUint8Array = await page.pdf({ 
      format: 'A4', 
      printBackground: true 
    });

    await browser.close();

    // ← THIS LINE FIXES THE ERROR
    return Buffer.from(pdfUint8Array);
  } catch (error) {
    logger.error('PDF generation failed:', error);
    throw error;
  }
};