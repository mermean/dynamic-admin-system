import pika
import json

def send_to_queue(message):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host="rabbitmq")
    )

    channel = connection.channel()

    channel.queue_declare(queue="permissions_queue")

    channel.basic_publish(
        exchange="",
        routing_key="permissions_queue",
        body=json.dumps(message)
    )

    connection.close()