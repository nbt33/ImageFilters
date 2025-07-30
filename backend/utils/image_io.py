# image_io.py
import cv2
import numpy as np
import base64


def image_bytes_to_array(image_bytes: bytes) -> np.ndarray:
    """Конвертирует байты в OpenCV-изображение."""
    arr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def array_to_base64(img_array: np.ndarray) -> str:
    """Конвертирует OpenCV-изображение в base64-строку."""
    _, buf = cv2.imencode('.png', img_array)
    return base64.b64encode(buf).decode()
