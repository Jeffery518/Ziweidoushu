import tarfile
import os

local_path = r"e:\Project_Personal\紫微斗数"
output_filename = "project.tar.gz"

def make_tarfile():
    with tarfile.open(output_filename, "w:gz") as tar:
        # Include docker-compose.yml
        tar.add(os.path.join(local_path, "docker-compose.yml"), arcname="docker-compose.yml")
        
        # Include backend
        backend_path = os.path.join(local_path, "backend")
        for root, dirs, files in os.walk(backend_path):
            dirs[:] = [d for d in dirs if d not in ['__pycache__', '.pytest_cache', 'venv', 'env']]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_path)
                tar.add(full_path, arcname=rel_path)
        
        # Include frontend
        frontend_path = os.path.join(local_path, "frontend")
        for root, dirs, files in os.walk(frontend_path):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', 'dist', 'build', '.git']]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_path)
                tar.add(full_path, arcname=rel_path)

        # Include README and PDF (Source)
        for extra in ["README.md", "倪海厦-天纪-天机道终稿(20100907非打印第一版）简体.pdf"]:
            file_path = os.path.join(local_path, extra)
            if os.path.exists(file_path):
                tar.add(file_path, arcname=extra)

        # Include Images directory
        img_path = os.path.join(local_path, "图片")
        if os.path.exists(img_path):
            for root, dirs, files in os.walk(img_path):
                for file in files:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, local_path)
                    tar.add(full_path, arcname=rel_path)

if __name__ == "__main__":
    make_tarfile()
    print(f"Created {output_filename}")
