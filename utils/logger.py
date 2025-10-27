import logging
import sys
from pathlib import Path

def setup_logger():
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    log_file = Path('logs/geoaware.log')
    log_file.parent.mkdir(exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger('geoaware')
