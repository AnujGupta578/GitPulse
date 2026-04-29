class OrderService:
    """
    Handles customer orders and integrates with the PaymentService.
    """
    def create_order(self, product_id: str, quantity: int):
        print(f"Creating order for {product_id} x{quantity}")
        return {"order_id": "ORD-99", "status": "pending"}

    def cancel_order(self, order_id: str):
        print(f"Cancelling order {order_id}")
        return True
