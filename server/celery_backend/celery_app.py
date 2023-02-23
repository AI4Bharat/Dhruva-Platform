from celery import Celery
from kombu import Queue, Exchange

app = Celery("dhruva_celery")
app.config_from_object("celery_backend.celeryconfig", namespace="CELERY")
app.autodiscover_tasks()


app.conf.task_queues = (
    Queue('data_log', exchange=Exchange('logs', type='direct')),

)

# Defaults
# app.conf.task_default_queue = 'celery'
# app.conf.task_default_exchange = 'tasks'
# app.conf.task_default_exchange_type = 'task_type'
# app.conf.task_default_routing_key = 'log_data'

# ToDo: Use Task routes instead of sending route for each task
# Documented methods are not working. Needs time
# app.conf.task_routes = ([
#     ('log_data', {'queue': 'data_log'}),  # , 'routing_key': 'log_data'
# ])


# python3 -m celery -A celery_backend.celery_app worker
# python3 -m celery -A celery_backend.celery_app flower --port=5555 --basic_auth=admin:admin --broker_api="http://admin:admin@localhost:15672/api/" --address="0.0.0.0"
# docker run --rm --hostname dhruva-rabbit --name dhruva-queue -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin -e RABBITMQ_DEFAULT_VHOST=dhruva_host -p 15672:15672 -p 5672:5672 rabbitmq:3-management
