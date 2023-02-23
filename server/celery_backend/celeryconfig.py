## Broker settings.
broker_url = "pyamqp://admin:admin@rabbithost:5672/dhruva_host"

# List of modules to import when the Celery worker starts.
imports = ("celery_backend.tasks.log_data",)

# CELERY_RESULT_BACKEND = "mongodb"
# CELERY_MONGODB_BACKEND_SETTINGS = {
#     "host": "127.0.0.1",
#     "port": 27017,
#     "database": "jobs", 
#     "taskmeta_collection": "stock_taskmeta_collection",
# }


#  docker run --rm --hostname dhruva-rabbit --name dhruva-queue \
#   -e RABBITMQ_DEFAULT_USER=admin \
#   -e RABBITMQ_DEFAULT_PASS=admin \
#   -e RABBITMQ_DEFAULT_VHOST=dhruva_host \
#   -p 15672:15672 \
#   -p 5672:5672 \
#   rabbitmq:3-management
