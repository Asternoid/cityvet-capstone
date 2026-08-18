import PDFDocument from 'pdfkit';
import { supabaseAdmin } from '../config/supabase.js';

export const generateMonthlySummaryPDF = async (month, year) => {
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  // PDF Content Generation
  doc.fontSize(20).fillColor('#0D5C63').text('CityVet Gingoog — Monthly Summary Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).fillColor('#333333').text(`Report Period: ${month}/${year}`);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Fetch metrics from database
  const { count: totalAppointments } = await supabaseAdmin
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  doc.fontSize(14).text(`Total Appointments: ${totalAppointments || 0}`);
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const filePath = `reports/Monthly_Summary_${month}_${year}_${Date.now()}.pdf`;

      // Upload generated PDF to Supabase Storage
      await supabaseAdmin.storage.from('gov-ids').upload(filePath, pdfBuffer, {
        contentType: 'application/pdf'
      });

      resolve(filePath);
    });
  });
};