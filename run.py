import os
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path


def resolve_project_root():
    current = Path(__file__).resolve().parent
    for _ in range(4):
        if (current / "backend").is_dir() and (current / "frontend").is_dir():
            return current
        current = current.parent
    raise RuntimeError("Cannot find project root with backend/ and frontend/ directories.")


ROOT = resolve_project_root()
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
VENV_DIR = ROOT / ".venv"
PYTHON_EXE = VENV_DIR / "Scripts" / "python.exe"


def wait_for_port(host, port, timeout=40):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(0.5)
    return False


def ensure_backend_venv():
    if not VENV_DIR.exists():
        print("Creating Python virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], check=True)
    print("Installing backend dependencies...")
    subprocess.run(
        [str(PYTHON_EXE), "-m", "pip", "install", "-q", "-r", str(BACKEND_DIR / "requirements.txt")],
        check=True,
    )
    return PYTHON_EXE


def ensure_frontend_deps():
    npm = shutil.which("npm")
    if not npm:
        raise RuntimeError("npm not found. Install Node.js first.")
    if not (FRONTEND_DIR / "node_modules").exists():
        print("Installing frontend dependencies...")
        subprocess.run([npm, "install"], cwd=str(FRONTEND_DIR), check=True)
    return npm


def main():
    print("\nStarting SkillBarter v2.0...\n")
    python_exe = ensure_backend_venv()
    npm = ensure_frontend_deps()

    backend_proc = subprocess.Popen(
        [str(python_exe), "app.py"],
        cwd=str(BACKEND_DIR),
    )
    print("Waiting for backend on http://127.0.0.1:5001...")
    if not wait_for_port("127.0.0.1", 5001, timeout=60):
        backend_proc.terminate()
        raise RuntimeError("Backend did not start in time.")
    print("Backend ready.\n")

    frontend_env = os.environ.copy()
    frontend_env["VITE_API_URL"] = "http://127.0.0.1:5001"
    frontend_proc = subprocess.Popen(
        [npm, "run", "dev"],
        cwd=str(FRONTEND_DIR),
        env=frontend_env,
    )

    print("SkillBarter running at http://localhost:5173")
    print("   Backend API:  http://localhost:5001")
    print("\n   Press Ctrl+C to stop both servers.\n")


    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()
        print("👋 Goodbye!\n")


if __name__ == "__main__":
    main()
