#!/usr/bin/env python3
"""
Database initialization script for CyberCrime Reporting System
This script creates all tables, stored procedures, triggers, and views
"""

import mysql.connector
from mysql.connector import Error
import os

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Rahu@12345',
    'database': 'cybercrime_db'
}

def init_database():
    """Initialize the complete database with all components"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database if not exists
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
            cursor.execute(f"USE {DB_CONFIG['database']}")
            
            print("Database created/connected successfully")
            
            # Read and execute the complete schema
            schema_file = 'database_schema.sql'
            if os.path.exists(schema_file):
                with open(schema_file, 'r') as file:
                    schema = file.read()
                
                # Split by semicolon and execute each statement
                statements = schema.split(';')
                for statement in statements:
                    statement = statement.strip()
                    if statement:
                        try:
                            cursor.execute(statement)
                            print(f"Executed: {statement[:50]}...")
                        except Error as e:
                            print(f"Error executing statement: {e}")
                            print(f"Statement: {statement[:100]}...")
                
                connection.commit()
                print("Database schema initialized successfully")
                
                # Verify stored procedures
                cursor.execute("SHOW PROCEDURE STATUS")
                procedures = cursor.fetchall()
                print(f"Created {len(procedures)} stored procedures:")
                for proc in procedures:
                    print(f"  - {proc[1]}")
                
                # Verify triggers
                cursor.execute("SHOW TRIGGERS")
                triggers = cursor.fetchall()
                print(f"Created {len(triggers)} triggers:")
                for trigger in triggers:
                    print(f"  - {trigger[0]}")
                
                # Verify views
                cursor.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'")
                views = cursor.fetchall()
                print(f"Created {len(views)} views:")
                for view in views:
                    print(f"  - {view[0]}")
                
            else:
                print(f"Schema file {schema_file} not found")
                
        else:
            print("Failed to connect to MySQL")
            
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("Database connection closed")

def test_stored_procedures():
    """Test the stored procedures"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            print("\nTesting stored procedures:")
            
            # Test GetUserStats
            try:
                cursor.callproc('GetUserStats')
                for result in cursor.stored_results():
                    stats = result.fetchone()
                    if stats:
                        print(f"User Stats: {stats}")
            except Error as e:
                print(f"Error testing GetUserStats: {e}")
            
            # Test GetReportStats
            try:
                cursor.callproc('GetReportStats')
                for result in cursor.stored_results():
                    stats = result.fetchone()
                    if stats:
                        print(f"Report Stats: {stats}")
            except Error as e:
                print(f"Error testing GetReportStats: {e}")
            
    except Error as e:
        print(f"Error testing procedures: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    print("Initializing CyberCrime Reporting System Database...")
    init_database()
    test_stored_procedures()
    print("\nDatabase initialization completed!") 