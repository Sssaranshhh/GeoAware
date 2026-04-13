import logging
import os
from datetime import datetime

LOG_FILE=f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log" # creates timestamp based log filename
logs_path=os.path.join(os.getcwd(),"logs",LOG_FILE) # builds a path 
os.makedirs(logs_path,exist_ok=True) # creates logs folder

LOG_FILE_PATH=os.path.join(logs_path,LOG_FILE) # full path to log file 

logging.basicConfig(
    filename=LOG_FILE_PATH,
    format="[ %(asctime)s ] %(lineno)d %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)