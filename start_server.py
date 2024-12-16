import os
import sys
import subprocess
import platform
import time
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def find_process_on_port(port):
    """Find process ID using the specified port."""
    try:
        if platform.system() == 'Windows':
            # Windows command to find process on port
            cmd = f'netstat -ano | findstr :{port}'
            output = subprocess.check_output(cmd, shell=True).decode()
            if output:
                # Extract PID from the last column
                return output.strip().split()[-1]
        else:
            # Unix/Linux/Mac command to find process on port
            cmd = f"lsof -i :{port} -t"
            output = subprocess.check_output(cmd, shell=True).decode()
            if output:
                return output.strip()
    except subprocess.CalledProcessError:
        return None
    return None

def kill_process(pid):
    """Kill process with given PID."""
    try:
        if platform.system() == 'Windows':
            subprocess.run(['taskkill', '/F', '/PID', str(pid)], check=True)
        else:
            subprocess.run(['kill', '-9', str(pid)], check=True)
        logger.info(f"Killed process with PID: {pid}")
        # Give the system a moment to release the port
        time.sleep(1)
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to kill process {pid}: {e}")

def start_server(port=3000):
    """Start the Node.js server after clearing the port."""
    try:
        # Check if port is in use
        pid = find_process_on_port(port)
        if pid:
            logger.info(f"Found existing process on port {port} with PID: {pid}")
            kill_process(pid)
        
        # Start the Node.js server
        logger.info("Starting Node.js server...")
        
        # Change to the directory containing server.js if needed
        # os.chdir('/path/to/your/project')  # Uncomment and modify if needed
        
        # Start the server using node
        process = subprocess.Popen(
            ['node', 'server.js'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Wait a moment to check if server started successfully
        time.sleep(2)
        
        # Check if process is still running
        if process.poll() is None:
            logger.info(f"Server started successfully on port {port}")
            
            # Stream server output
            while True:
                output = process.stdout.readline()
                if output:
                    print(output.strip())
                if process.poll() is not None:
                    break
        else:
            stdout, stderr = process.communicate()
            logger.error(f"Server failed to start:\nStdout: {stdout}\nStderr: {stderr}")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        port = 3000  # Default port
        if len(sys.argv) > 1:
            port = int(sys.argv[1])
        
        start_server(port)
    except KeyboardInterrupt:
        logger.info("\nShutting down server...")
        sys.exit(0) 