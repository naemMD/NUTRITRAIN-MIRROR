from app import create_app
import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()
app = create_app()

if __name__ == "__main__":
    host = os.getenv('APP_HOST')
    port = int(os.getenv('APP_PORT'))
    print("server runnig on ", host, ":", port) 
    uvicorn.run(app, host=host, port=port)