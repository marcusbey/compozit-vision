#!/usr/bin/env python3
import os
import shutil

def remove_directory_if_exists(path):
    if os.path.exists(path):
        try:
            shutil.rmtree(path)
            print(f"✅ Removed: {path}")
            return True
        except Exception as e:
            print(f"❌ Failed to remove {path}: {e}")
            return False
    else:
        print(f"⚠️  Directory not found: {path}")
        return False

def main():
    print("🧹 Starting cleanup of empty numbered directories...")
    
    base_path = "mobile/src/screens"
    
    directories_to_remove = [
        f"{base_path}/05-image-refinement",
        f"{base_path}/06-results", 
        f"{base_path}/07-dashboard",
        f"{base_path}/05-content-selection",
        f"{base_path}/FurnitureSelection",
        f"{base_path}/04-project-wizard"  # Now that we've moved important files
    ]
    
    removed_count = 0
    for directory in directories_to_remove:
        if remove_directory_if_exists(directory):
            removed_count += 1
    
    print(f"\n🎉 Cleanup completed! Removed {removed_count} directories.")
    
    # Verify the remaining structure
    print("\n📂 Remaining screen directories:")
    if os.path.exists(base_path):
        for item in sorted(os.listdir(base_path)):
            item_path = os.path.join(base_path, item)
            if os.path.isdir(item_path):
                print(f"  • {item}")

if __name__ == "__main__":
    main()