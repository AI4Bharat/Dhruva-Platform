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

# TODO: Use Task routes instead of sending route for each task
# Documented methods are not working. Needs time
# app.conf.task_routes = ([
#     ('log_data', {'queue': 'data_log'}),  # , 'routing_key': 'log_data'
# ])
