import cv2
import numpy as np

def apply_kmeans(img, k: int = 4):
    # Подготовка данных
    Z = img.reshape((-1, 3)).astype(np.float32)
    # Критерии остановки
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(Z, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    # Восстановление изображения
    centers = np.uint8(centers)
    segmented = centers[labels.flatten()]
    return segmented.reshape((img.shape))