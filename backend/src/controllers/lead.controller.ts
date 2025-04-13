import { Request, Response } from 'express';
import { Lead, leadModel } from '../models/lead.model';
import { parse } from 'csv-parse';

export const leadController = {
  /**
   * Get all leads with optional filtering
   */
  getAll: async (req: Request, res: Response) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        source: req.query.source as string | undefined,
        assigned_to: req.query.assigned_to ? parseInt(req.query.assigned_to as string) : undefined,
        store_id: req.query.store_id ? parseInt(req.query.store_id as string) : undefined,
        search: req.query.search as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };
      
      const leads = await leadModel.getAll(filters);
      
      // Transform the leads to include storeId for frontend compatibility
      const transformedLeads = leads.map(lead => ({
        ...lead,
        storeId: lead.store_id
      }));
      
      res.status(200).json({
        success: true,
        message: 'Leads retrieved successfully',
        data: transformedLeads
      });
    } catch (error) {
      console.error('Error in getAll controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve leads',
        error: (error as Error).message
      });
    }
  },

  /**
   * Get lead by ID
   */
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lead ID'
        });
      }
      
      const lead = await leadModel.getById(id);
      
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }
      
      // Add storeId for frontend compatibility
      const transformedLead = {
        ...lead,
        storeId: lead.store_id
      };
      
      res.status(200).json({
        success: true,
        message: 'Lead retrieved successfully',
        data: transformedLead
      });
    } catch (error) {
      console.error('Error in getById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve lead',
        error: (error as Error).message
      });
    }
  },

  /**
   * Create a new lead
   */
  create: async (req: Request, res: Response) => {
    try {
      const { name, email, phone, source, status, notes, assigned_to, store_id } = req.body;
      
      // Validate required fields
      if (!name || !source) {
        return res.status(400).json({
          success: false,
          message: 'Name and source are required fields'
        });
      }
      
      // Validate status if provided
      if (status && !['new', 'contacted', 'qualified', 'converted', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      
      const lead: Lead = {
        name,
        email: email || '',
        phone: phone || '',
        source,
        status: status || 'new',
        notes,
        assigned_to: assigned_to ? parseInt(assigned_to) : undefined,
        store_id: store_id ? parseInt(store_id) : undefined
      };
      
      const leadId = await leadModel.create(lead);
      
      // Add storeId for frontend compatibility
      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: {
          id: leadId,
          ...lead,
          storeId: lead.store_id
        }
      });
    } catch (error) {
      console.error('Error in create controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create lead',
        error: (error as Error).message
      });
    }
  },

  /**
   * Update an existing lead
   */
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lead ID'
        });
      }
      
      // Check if lead exists
      const existingLead = await leadModel.getById(id);
      
      if (!existingLead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }
      
      const { name, email, phone, source, status, notes, assigned_to, store_id } = req.body;
      
      // Validate status if provided
      if (status && !['new', 'contacted', 'qualified', 'converted', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      
      const leadUpdate: Partial<Lead> = {};
      
      if (name !== undefined) leadUpdate.name = name;
      if (email !== undefined) leadUpdate.email = email;
      if (phone !== undefined) leadUpdate.phone = phone;
      if (source !== undefined) leadUpdate.source = source;
      if (status !== undefined) leadUpdate.status = status;
      if (notes !== undefined) leadUpdate.notes = notes;
      if (assigned_to !== undefined) {
        leadUpdate.assigned_to = assigned_to ? parseInt(assigned_to) : undefined;
      }
      if (store_id !== undefined) {
        leadUpdate.store_id = store_id ? parseInt(store_id) : undefined;
      }
      
      const updated = await leadModel.update(id, leadUpdate);
      
      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'No changes to update'
        });
      }
      
      // Get the updated lead
      const updatedLead = await leadModel.getById(id);
      
      // Add storeId for frontend compatibility
      const transformedLead = {
        ...updatedLead,
        storeId: updatedLead.store_id
      };
      
      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: transformedLead
      });
    } catch (error) {
      console.error('Error in update controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lead',
        error: (error as Error).message
      });
    }
  },

  /**
   * Delete a lead
   */
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lead ID'
        });
      }
      
      const deleted = await leadModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      console.error('Error in delete controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lead',
        error: (error as Error).message
      });
    }
  },

  /**
   * Get lead statistics
   */
  getStats: async (req: Request, res: Response) => {
    try {
      const sourceStats = await leadModel.getSourceStats();
      const statusStats = await leadModel.getStatusStats();
      
      res.status(200).json({
        success: true,
        message: 'Lead statistics retrieved successfully',
        data: {
          sourceStats,
          statusStats
        }
      });
    } catch (error) {
      console.error('Error in getStats controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve lead statistics',
        error: (error as Error).message
      });
    }
  },

  /**
   * Import leads from CSV
   */
  importFromCsv: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const csvContent = req.file.buffer.toString('utf8');
      
      // Parse CSV
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      const records: any[] = [];
      
      // Parse the CSV content
      parser.write(csvContent);
      parser.end();
      
      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });
      
      await new Promise<void>((resolve, reject) => {
        parser.on('error', reject);
        parser.on('end', () => resolve());
      });
      
      if (records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'CSV file is empty or invalid'
        });
      }
      
      // Validate and transform records
      const leads: Lead[] = [];
      const errors: { row: number; message: string }[] = [];
      
      records.forEach((record, index) => {
        if (!record.name || !record.source) {
          errors.push({
            row: index + 2, // +2 because index is 0-based and we skip the header row
            message: 'Name and source are required fields'
          });
          return;
        }
        
        // Validate status if provided
        if (record.status && !['new', 'contacted', 'qualified', 'converted', 'closed'].includes(record.status)) {
          errors.push({
            row: index + 2,
            message: 'Invalid status value'
          });
          return;
        }
        
        leads.push({
          name: record.name,
          email: record.email || '',
          phone: record.phone || '',
          source: record.source,
          status: record.status || 'new',
          notes: record.notes || '',
          assigned_to: record.assigned_to ? parseInt(record.assigned_to) : undefined,
          store_id: record.store_id ? parseInt(record.store_id) : undefined
        });
      });
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'CSV file contains errors',
          errors
        });
      }
      
      // Import leads
      const importedCount = await leadModel.importLeads(leads);
      
      res.status(200).json({
        success: true,
        message: `Successfully imported ${importedCount} leads`,
        data: {
          importedCount
        }
      });
    } catch (error) {
      console.error('Error in importFromCsv controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import leads from CSV',
        error: (error as Error).message
      });
    }
  }
};
