import os

# Files to modify
svgs_path = "/Users/itsupport/Projects/Throw-It-App/ril/Portofolio/src/apps/portfolio/components/icons/SVGs.tsx"
images_path = "/Users/itsupport/Projects/Throw-It-App/ril/Portofolio/src/apps/portfolio/components/icons/Images.tsx"

def fix_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace width="max-content" and height="max-content"
    updated = content.replace('width="max-content"', 'width="100%"').replace('height="max-content"', 'height="100%"')
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(updated)
    print(f"Updated {file_path}")

fix_file(svgs_path)
fix_file(images_path)
