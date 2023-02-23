basic_auth=["admin:admin"]
address = "0.0.0.0"
port = 5555

# RabbitMQ management api
# broker_api = "pyamqp://admin:admin@localhost:5672/dhruva_host"
broker_api = "http://admin:admin@localhost:15672/api/"
# FLOWER_BROKER_API_URL: http://guest:guest@broker:15672/api

# Enable debug logging
logging = 'DEBUG'
