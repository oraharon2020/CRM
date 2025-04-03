import { query } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  default_store_id?: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'user';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'user';
  default_store_id?: number | null;
}

class UserModel {
  /**
   * Find a user by ID
   */
  async findById(id: number): Promise<User | null> {
    try {
      const users = await query(
        'SELECT id, name, email, role, default_store_id, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      
      return users.length > 0 ? users[0] as User : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      const users = await query(
        'SELECT id, name, email, password, role, default_store_id, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );
      
      return users.length > 0 ? users[0] as UserWithPassword : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    try {
      const users = await query(
        'SELECT id, name, email, role, default_store_id, created_at, updated_at FROM users ORDER BY id'
      );
      
      return users as User[];
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }
  
  /**
   * Create a new user
   */
  async create(userData: CreateUserData): Promise<User> {
    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Insert the user
      const result = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [
          userData.name,
          userData.email,
          hashedPassword,
          userData.role || 'user'
        ]
      );
      
      // Get the inserted user
      const userId = result[0].id;
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Failed to retrieve created user');
      }
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Update a user
   */
  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    try {
      // Add fields to update
      const updateFields: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      if (userData.name) {
        updateFields.push(`name = $${paramIndex}`);
        queryParams.push(userData.name);
        paramIndex++;
      }
      
      if (userData.email) {
        updateFields.push(`email = $${paramIndex}`);
        queryParams.push(userData.email);
        paramIndex++;
      }
      
      if (userData.password) {
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        
        updateFields.push(`password = $${paramIndex}`);
        queryParams.push(hashedPassword);
        paramIndex++;
      }
      
      if (userData.role) {
        updateFields.push(`role = $${paramIndex}`);
        queryParams.push(userData.role);
        paramIndex++;
      }
      
      // Handle default_store_id (can be null)
      if (userData.default_store_id !== undefined) {
        updateFields.push(`default_store_id = $${paramIndex}`);
        queryParams.push(userData.default_store_id);
        paramIndex++;
      }
      
      // If no fields to update, return the current user
      if (updateFields.length === 0) {
        return await this.findById(id);
      }
      
      // Build the query
      const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
      queryParams.push(id);
      
      // Execute the query
      await query(sql, queryParams);
      
      // Get the updated user
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Delete a user
   */
  async delete(id: number): Promise<boolean> {
    try {
      // First check if the user exists
      const user = await this.findById(id);
      if (!user) {
        return false;
      }
      
      // Check if user has any references in other tables
      // Update leads assigned to this user to NULL
      await query('UPDATE leads SET assigned_to = NULL WHERE assigned_to = $1', [id]);
      
      // Now delete the user
      const result = await query('DELETE FROM users WHERE id = $1', [id]);
      
      // In PostgreSQL, the result doesn't have affectedRows but rowCount
      return true; // If we got here without errors, the delete was successful
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  /**
   * Verify a user's password
   */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      // Get the user with password
      const user = await this.findByEmail(email);
      
      if (!user) {
        return null;
      }
      
      // Compare the password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return null;
      }
      
      // Return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  /**
   * Get a user's default store
   */
  async getDefaultStore(userId: number): Promise<number | null> {
    try {
      const result = await query(
        'SELECT default_store_id FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0].default_store_id;
    } catch (error) {
      console.error('Error getting default store:', error);
      throw error;
    }
  }
  
  /**
   * Set a user's default store
   */
  async setDefaultStore(userId: number, storeId: number | null): Promise<boolean> {
    try {
      await query(
        'UPDATE users SET default_store_id = $1 WHERE id = $2',
        [storeId, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error setting default store:', error);
      throw error;
    }
  }
}

export default new UserModel();
