import zipfile
import os

local_path = r"e:\Project_Personal\紫微斗数"
zip_filename = "project.zip"

def zip_project():
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Include docker-compose.yml
        zipf.write(os.path.join(local_path, "docker-compose.yml"), "docker-compose.yml")
        
        # Include backend
        backend_path = os.path.join(local_path, "backend")
        for root, dirs, files in os.walk(backend_path):
            dirs[:] = [d for d in dirs if d not in ['__pycache__', '.pytest_cache', 'venv', 'env']]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_path)
                zipf.write(full_path, rel_path)
        
        # Include frontend
        frontend_path = os.path.join(local_path, "frontend")
        for root, dirs, files in os.walk(frontend_path):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', 'dist', 'build', '.git']]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_path)
                zipf.write(full_path, rel_path)

if __name__ == "__main__":
    zip_project()
    print(f"Zipped project to {zip_filename}")
