import pika

def callback(ch, method, properties, body):
    print("Mesaj alındı:")
    print(body.decode())

    print("İşlem başarıyla tamamlandı 🚀")

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host="localhost")
)

channel = connection.channel()

channel.queue_declare(queue="permission_queue")

channel.basic_consume(
    queue="permission_queue",
    on_message_callback=callback,
    auto_ack=True
)

print("Consumer dinliyor...")

channel.start_consuming()