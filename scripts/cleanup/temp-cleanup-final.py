#!/usr/bin/env python3
import os
import shutil

# List of temporary directories to remove
temp_dirs = [
    'temp-01-auth-to-delete',
    'temp-02-onboarding-to-delete',
    'temp-03-payment-to-delete',
    'temp-04-project-wizard-to-delete',
    'temp-05-content-selection-to-delete',
    'temp-FurnitureSelection-to-delete'
]

# Also clean up the temporary files
temp_files = [
    'cleanup_temp.sh',
    'temp-cleanup-script.sh',
    'temp-cleanup.py'
]

print("Cleaning up temporary directories and files...")

# Remove temporary directories
for dir_name in temp_dirs:
    if os.path.exists(dir_name):
        shutil.rmtree(dir_name)
        print(f"Removed directory: {dir_name}")
    else:
        print(f"Directory not found: {dir_name}")

# Remove temporary files
for file_name in temp_files:
    if os.path.exists(file_name):
        os.remove(file_name)
        print(f"Removed file: {file_name}")
    else:
        print(f"File not found: {file_name}")

print("Cleanup completed successfully!")