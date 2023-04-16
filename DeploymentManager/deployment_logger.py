import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

f = logging.Formatter(
    '%(asctime)s  %(levelname)s- %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
fh = logging.FileHandler("deploymentLogger.log")
fh.setFormatter(f)
logger.addHandler(fh)
